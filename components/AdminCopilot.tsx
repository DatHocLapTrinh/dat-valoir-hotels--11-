import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, BarChart3, Users, Calendar } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import Markdown from 'react-markdown';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { ROOMS_DATA, EXPERIENCES_DATA } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getRevenueReportDeclaration: FunctionDeclaration = {
  name: 'getRevenueReport',
  description: 'Get a comprehensive revenue report including total revenue, revenue by location, and revenue by booking type.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const getOccupancyReportDeclaration: FunctionDeclaration = {
  name: 'getOccupancyReport',
  description: 'Get an occupancy report showing total bookings, active bookings, and cancelled bookings.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const getRecentBookingsDeclaration: FunctionDeclaration = {
  name: 'getRecentBookings',
  description: 'Get the most recent bookings.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      limit: { type: Type.NUMBER, description: 'Number of recent bookings to fetch (default 5)' }
    }
  }
};

const getServiceRequestsDeclaration: FunctionDeclaration = {
  name: 'getServiceRequests',
  description: 'Get service requests filtered by status.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, description: 'Status to filter by: "PENDING", "IN_PROGRESS", "COMPLETED", or "ALL"' }
    }
  }
};

const updateServiceRequestStatusDeclaration: FunctionDeclaration = {
  name: 'updateServiceRequestStatus',
  description: 'Update the status of a service request (e.g., from PENDING to IN_PROGRESS or COMPLETED).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      requestId: { type: Type.STRING, description: 'The ID of the service request' },
      status: { type: Type.STRING, description: 'The new status: "PENDING", "IN_PROGRESS", or "COMPLETED"' }
    },
    required: ['requestId', 'status']
  }
};

const getUrgentTasksDeclaration: FunctionDeclaration = {
  name: 'getUrgentTasks',
  description: 'Get a list of urgent tasks, including pending service requests and upcoming check-ins.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const predictStaffingNeedsDeclaration: FunctionDeclaration = {
  name: 'predictStaffingNeeds',
  description: 'Predict staffing needs based on current active bookings and pending service requests.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const getGuestProfileDeclaration: FunctionDeclaration = {
  name: 'getGuestProfile',
  description: 'Get a comprehensive 360-degree profile of a guest using their email address. Includes booking history, total spent, and preferences.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      email: { type: Type.STRING, description: 'The email address of the guest' }
    },
    required: ['email']
  }
};

const searchSOPDeclaration: FunctionDeclaration = {
  name: 'searchSOP',
  description: 'Search the hotel\'s Standard Operating Procedures (SOP) and Knowledge Base for staff training and guidelines.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'The search query or topic (e.g., "fire", "refund", "VIP")' }
    },
    required: ['query']
  }
};

const SOP_DATABASE = [
  {
    topic: "Xử lý báo cháy (Fire Emergency)",
    department: "Security & All Staff",
    content: "1. Giữ bình tĩnh.\n2. Kích hoạt chuông báo cháy gần nhất nếu chưa kêu.\n3. Hướng dẫn khách hàng di chuyển ra lối thoát hiểm bằng cầu thang bộ (KHÔNG dùng thang máy).\n4. Tập trung tại điểm danh quy định (Sân trước khách sạn).\n5. Báo cáo quân số cho Trưởng bộ phận."
  },
  {
    topic: "Hoàn tiền cho khách (Guest Refund)",
    department: "Front Office",
    content: "1. Xác minh lý do hoàn tiền (lỗi dịch vụ, hủy phòng đúng hạn).\n2. Lập phiếu yêu cầu hoàn tiền (Refund Request Form) trên hệ thống.\n3. Yêu cầu Quản lý ca (Duty Manager) phê duyệt.\n4. Thông báo cho khách thời gian tiền hoàn về tài khoản (thường 3-5 ngày làm việc).\n5. Gửi email xác nhận cho khách."
  },
  {
    topic: "Đón tiếp khách VIP (VIP Check-in)",
    department: "Front Office & Concierge",
    content: "1. Nhận diện khách VIP ngay khi xe đến.\n2. Concierge mở cửa xe, chào bằng tên khách.\n3. Lễ tân chuẩn bị sẵn welcome drink và khăn lạnh.\n4. Quản lý sảnh (Lobby Manager) trực tiếp ra chào và dẫn khách lên phòng làm thủ tục in-room check-in.\n5. Đảm bảo quà welcome (trái cây, rượu vang) đã được setup trong phòng trước khi khách lên."
  },
  {
    topic: "Xử lý đồ thất lạc (Lost and Found)",
    department: "Housekeeping",
    content: "1. Khi phát hiện đồ khách để quên, giữ nguyên hiện trường và chụp ảnh.\n2. Báo ngay cho Giám sát Buồng phòng.\n3. Ghi thẻ Lost & Found (Ngày, phòng, người tìm thấy, mô tả vật phẩm).\n4. Bàn giao cho bộ phận An ninh niêm phong và lưu kho.\n5. Lễ tân liên hệ khách để xác nhận phương án gửi trả."
  }
];

interface Message {
  role: 'user' | 'model';
  text: string;
}

const COLORS = ['#eab308', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

const AdminCopilot: React.FC = () => {
  const { bookings, serviceRequests, updateServiceRequestStatus } = useBooking();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Xin chào ${user?.name || 'Admin'}! Tôi là **AI Operations Manager** của Dat Valoir. Tôi có thể giúp bạn phân tích dữ liệu, cập nhật trạng thái công việc và dự báo nhân sự. Bạn cần hỗ trợ gì hôm nay?` }
  ]);
  const [apiHistory, setApiHistory] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "Báo cáo doanh thu tổng quan",
    "Các công việc khẩn cấp",
    "Tra cứu quy trình (SOP)"
  ];

  const systemInstruction = `
You are the AI Data Analyst and Operations Manager for "Dat Valoir", a luxury hotel brand.
Your primary user is the Hotel Admin or Staff.
Your tone is professional, analytical, concise, and helpful.

You have access to real-time hotel data through function calls.
When the user asks for data, call the appropriate function.
You can also UPDATE service request statuses if the user asks you to.
You can also look up Guest Profiles (CRM) to provide 360-degree views and upsell suggestions.
You can also search the hotel's Standard Operating Procedures (SOP) to assist staff with training and guidelines. Present SOPs clearly using Markdown.
After receiving the data or performing an action, summarize it clearly and ALWAYS include a UI tag at the end of your response so the system can render a beautiful chart or table.

Available UI Tags:
- For Revenue Data: [UI:CHART:REVENUE]
- For Occupancy Data: [UI:CHART:OCCUPANCY]
- For Recent Bookings: [UI:TABLE:BOOKINGS]
- For Service Requests or Urgent Tasks: [UI:TABLE:SERVICES]
- For Guest Profiles or SOPs: Do not use a UI tag. Instead, use rich Markdown (tables, blockquotes, bold text, bullet points) to present the information beautifully.

Example Response:
"Tổng doanh thu hiện tại là $50,000. Dưới đây là biểu đồ chi tiết:
[UI:CHART:REVENUE]"
`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const parsePrice = (priceString: string) => {
    if (!priceString) return 0;
    return parseInt(priceString.replace(/[^0-9]/g, ''), 10);
  };

  const handleSend = async (textToProcess?: string) => {
    const userMessage = typeof textToProcess === 'string' ? textToProcess.trim() : input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const currentParts: any[] = [{ text: userMessage }];
      let currentContents = [...apiHistory, { role: 'user', parts: currentParts }];

      let response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: currentContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          tools: [{ functionDeclarations: [getRevenueReportDeclaration, getOccupancyReportDeclaration, getRecentBookingsDeclaration, getServiceRequestsDeclaration, updateServiceRequestStatusDeclaration, getUrgentTasksDeclaration, predictStaffingNeedsDeclaration, getGuestProfileDeclaration, searchSOPDeclaration] }]
        }
      });

      while (response.functionCalls && response.functionCalls.length > 0) {
        currentContents.push(response.candidates![0].content);
        const functionResponsesParts: any[] = [];

        for (const call of response.functionCalls) {
          let functionResult;

          if (call.name === 'getRevenueReport') {
            let totalRevenue = 0;
            const revenueByLocation: Record<string, number> = {};
            const revenueByType: Record<string, number> = { ROOM: 0, EXPERIENCE: 0 };

            bookings.forEach(b => {
              if (b.status !== 'CANCELLED') {
                const price = parsePrice(b.totalPrice);
                totalRevenue += price;
                revenueByType[b.type] += price;
                
                const loc = b.itemDetails.location || 'Unknown';
                revenueByLocation[loc] = (revenueByLocation[loc] || 0) + price;
              }
            });

            functionResult = { success: true, totalRevenue, revenueByLocation, revenueByType };
          } else if (call.name === 'getOccupancyReport') {
            const totalBookings = bookings.length;
            const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
            const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
            
            const bookingsByType: Record<string, number> = { ROOM: 0, EXPERIENCE: 0 };
            bookings.forEach(b => {
                bookingsByType[b.type] = (bookingsByType[b.type] || 0) + 1;
            });

            functionResult = { success: true, totalBookings, activeBookings, cancelledBookings, bookingsByType };
          } else if (call.name === 'getRecentBookings') {
            const args = call.args as any;
            const limit = args.limit || 5;
            const recent = bookings.slice(0, limit).map(b => ({
              id: b.id,
              type: b.type,
              itemName: b.itemDetails.name,
              status: b.status,
              price: b.totalPrice,
              date: b.bookedAt
            }));
            functionResult = { success: true, recentBookings: recent };
          } else if (call.name === 'getServiceRequests') {
            const args = call.args as any;
            const status = args.status || 'ALL';
            let filtered = serviceRequests;
            if (status !== 'ALL') {
                filtered = serviceRequests.filter(sr => sr.status === status);
            }
            functionResult = { success: true, serviceRequests: filtered.map(sr => ({
                id: sr.id,
                room: sr.roomNumber,
                type: sr.serviceType,
                status: sr.status,
                details: sr.details
            }))};
          } else if (call.name === 'updateServiceRequestStatus') {
            const args = call.args as any;
            try {
              await updateServiceRequestStatus(args.requestId, args.status);
              functionResult = { success: true, message: `Status updated to ${args.status}` };
            } catch (e: any) {
              functionResult = { success: false, error: e.message };
            }
          } else if (call.name === 'getUrgentTasks') {
            const pendingRequests = serviceRequests.filter(sr => sr.status === 'PENDING').map(sr => ({
                id: sr.id, room: sr.roomNumber, type: sr.serviceType, status: sr.status, details: sr.details
            }));
            
            // Simple logic for upcoming check-ins (next 2 days)
            const today = new Date();
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(today.getDate() + 2);
            
            const upcomingCheckIns = bookings.filter(b => {
                if (b.status !== 'CONFIRMED' || b.type !== 'ROOM') return false;
                const checkInDate = new Date(b.dates.checkIn);
                return checkInDate >= today && checkInDate <= twoDaysFromNow;
            }).map(b => ({
                id: b.id, name: b.itemDetails.name, checkIn: b.dates.checkIn
            }));

            functionResult = { success: true, urgentServiceRequests: pendingRequests, upcomingCheckIns };
          } else if (call.name === 'predictStaffingNeeds') {
            const activeRooms = bookings.filter(b => (b.status === 'CONFIRMED' || b.status === 'COMPLETED') && b.type === 'ROOM').length;
            const pendingRequests = serviceRequests.filter(sr => sr.status === 'PENDING').length;
            
            // Simple heuristic: 1 staff per 5 active rooms + 1 staff per 3 pending requests
            const housekeepingNeeded = Math.ceil(activeRooms / 5);
            const maintenanceNeeded = Math.ceil(pendingRequests / 3);
            const frontDeskNeeded = Math.max(2, Math.ceil(activeRooms / 10));

            functionResult = { 
                success: true, 
                prediction: {
                    housekeeping: housekeepingNeeded,
                    maintenance: maintenanceNeeded,
                    frontDesk: frontDeskNeeded,
                    total: housekeepingNeeded + maintenanceNeeded + frontDeskNeeded
                },
                factors: { activeRooms, pendingRequests }
            };
          } else if (call.name === 'getGuestProfile') {
            const args = call.args as any;
            const email = args.email?.toLowerCase();
            
            const guestBookings = bookings.filter(b => b.userId.toLowerCase() === email);
            
            if (guestBookings.length === 0) {
                functionResult = { success: false, message: `Không tìm thấy khách hàng nào với email ${email}.` };
            } else {
                const totalBookings = guestBookings.length;
                const totalSpent = guestBookings.reduce((acc, b) => acc + (b.status !== 'CANCELLED' ? parsePrice(b.totalPrice) : 0), 0);
                const roomBookings = guestBookings.filter(b => b.type === 'ROOM');
                const experienceBookings = guestBookings.filter(b => b.type === 'EXPERIENCE');
                
                const locations = [...new Set(guestBookings.map(b => b.itemDetails.location).filter(Boolean))];
                
                const roomCounts = roomBookings.reduce((acc, b) => {
                    acc[b.itemDetails.name] = (acc[b.itemDetails.name] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                const favoriteRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chưa có';

                const latestBooking = guestBookings.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())[0];

                functionResult = {
                    success: true,
                    profile: {
                        email: email,
                        metrics: {
                            totalBookings,
                            completedStays: roomBookings.filter(b => b.status === 'COMPLETED').length,
                            totalSpent: `$${totalSpent.toLocaleString()}`,
                            guestClass: totalSpent > 5000 ? 'VIP Platinum' : totalSpent > 2000 ? 'VIP Gold' : 'Silver'
                        },
                        preferences: {
                            locationsVisited: locations,
                            favoriteRoomType: favoriteRoom,
                            experiencesBooked: experienceBookings.map(b => b.itemDetails.name)
                        },
                        latestActivity: latestBooking.bookedAt,
                        recentBookings: guestBookings.slice(0, 3).map(b => ({
                            item: b.itemDetails.name,
                            date: b.bookedAt,
                            status: b.status
                        }))
                    }
                };
            }
          } else if (call.name === 'searchSOP') {
            const args = call.args as any;
            const query = args.query?.toLowerCase() || '';
            const results = SOP_DATABASE.filter(sop => 
                sop.topic.toLowerCase().includes(query) || 
                sop.content.toLowerCase().includes(query) ||
                sop.department.toLowerCase().includes(query)
            );
            
            if (results.length === 0) {
                functionResult = { success: false, message: `Không tìm thấy quy trình nào khớp với từ khóa: "${args.query}". Vui lòng thử từ khóa khác (ví dụ: "cháy", "hoàn tiền", "VIP").` };
            } else {
                functionResult = { success: true, results };
            }
          } else {
            functionResult = { success: false, error: 'Unknown function call' };
          }

          functionResponsesParts.push({
            functionResponse: {
              name: call.name,
              response: functionResult
            }
          });
        }

        currentContents.push({
          role: 'user',
          parts: functionResponsesParts
        });

        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: currentContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            tools: [{ functionDeclarations: [getRevenueReportDeclaration, getOccupancyReportDeclaration, getRecentBookingsDeclaration, getServiceRequestsDeclaration, updateServiceRequestStatusDeclaration, getUrgentTasksDeclaration, predictStaffingNeedsDeclaration, getGuestProfileDeclaration, searchSOPDeclaration] }]
          }
        });
      }

      const responseText = response.text;
      if (responseText) {
        currentContents.push({ role: 'model', parts: [{ text: responseText }] });
        setApiHistory(currentContents);
        setMessages(prev => [...prev, { role: 'model', text: responseText as string }]);
      }
    } catch (error) {
      console.error("AdminCopilot error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, hệ thống phân tích đang gặp sự cố. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (text: string) => {
    let cleanText = text;
    
    const hasRevenueChart = cleanText.includes('[UI:CHART:REVENUE]');
    const hasOccupancyChart = cleanText.includes('[UI:CHART:OCCUPANCY]');
    const hasBookingsTable = cleanText.includes('[UI:TABLE:BOOKINGS]');
    const hasServicesTable = cleanText.includes('[UI:TABLE:SERVICES]');

    cleanText = cleanText.replace(/\[UI:CHART:REVENUE\]/g, '');
    cleanText = cleanText.replace(/\[UI:CHART:OCCUPANCY\]/g, '');
    cleanText = cleanText.replace(/\[UI:TABLE:BOOKINGS\]/g, '');
    cleanText = cleanText.replace(/\[UI:TABLE:SERVICES\]/g, '');

    // Prepare chart data
    const revenueByLocationData = Object.entries(
        bookings.filter(b => b.status !== 'CANCELLED').reduce((acc, b) => {
            const loc = b.itemDetails.location || 'Unknown';
            acc[loc] = (acc[loc] || 0) + parsePrice(b.totalPrice);
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const revenueByTypeData = [
        { name: 'Phòng', value: bookings.filter(b => b.status !== 'CANCELLED' && b.type === 'ROOM').reduce((acc, b) => acc + parsePrice(b.totalPrice), 0) },
        { name: 'Trải nghiệm', value: bookings.filter(b => b.status !== 'CANCELLED' && b.type === 'EXPERIENCE').reduce((acc, b) => acc + parsePrice(b.totalPrice), 0) }
    ];

    const occupancyData = [
        { name: 'Đã xác nhận', value: bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length },
        { name: 'Đã hủy', value: bookings.filter(b => b.status === 'CANCELLED').length }
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-yellow-500">
          <Markdown>{cleanText}</Markdown>
        </div>
        
        {hasRevenueChart && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4 text-center">Doanh thu theo địa điểm</h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByLocationData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#eab308' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Doanh thu']}
                                />
                                <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4 text-center">Cơ cấu doanh thu</h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={revenueByTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {revenueByTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Doanh thu']}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}

        {hasOccupancyChart && (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4 text-center">Trạng thái đặt phòng</h4>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={occupancyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {hasBookingsTable && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Mã Đặt</th>
                                <th className="px-4 py-3">Loại</th>
                                <th className="px-4 py-3">Tên</th>
                                <th className="px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {bookings.slice(0, 5).map(b => (
                                <tr key={b.id} className="hover:bg-white/5">
                                    <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                                    <td className="px-4 py-3">{b.type === 'ROOM' ? 'Phòng' : 'Trải nghiệm'}</td>
                                    <td className="px-4 py-3 truncate max-w-[120px]">{b.itemDetails.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                            b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {hasServicesTable && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Phòng</th>
                                <th className="px-4 py-3">Loại</th>
                                <th className="px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {serviceRequests.slice(0, 5).map(sr => (
                                <tr key={sr.id} className="hover:bg-white/5">
                                    <td className="px-4 py-3 font-bold">{sr.roomNumber}</td>
                                    <td className="px-4 py-3 capitalize">{sr.serviceType}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            sr.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                            sr.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {sr.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group flex items-center justify-center"
      >
        <BarChart3 size={24} className="group-hover:animate-pulse" />
        <span className="absolute right-full mr-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
          AI Operations Manager
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-black p-4 border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <BarChart3 size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Operations Manager</h3>
            <p className="text-blue-400 text-xs flex items-center gap-1">
              <Sparkles size={10} /> Powered by Gemini
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-sm'
            }`}>
              {msg.role === 'model' ? renderMessageContent(msg.text) : <p className="text-sm">{msg.text}</p>}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm p-4 flex items-center gap-3">
              <Loader2 size={16} className="text-blue-500 animate-spin" />
              <span className="text-xs text-gray-400">Đang phân tích dữ liệu...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="text-[11px] px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors whitespace-nowrap"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-black/50 border-t border-white/10 shrink-0">
        <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-2 focus-within:border-blue-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về doanh thu, phòng trống..."
            className="w-full bg-transparent text-white text-sm placeholder-gray-500 outline-none resize-none max-h-32 min-h-[40px] py-2 px-2 scrollbar-thin scrollbar-thumb-white/20"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-lg transition-colors shrink-0 mb-0.5"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCopilot;
