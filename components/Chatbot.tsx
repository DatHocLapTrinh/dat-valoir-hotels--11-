import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Image as ImageIcon, XCircle } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import Markdown from 'react-markdown';
import { ROOMS_DATA, LOCATIONS, EXPERIENCES_DATA } from '../constants';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

// Initialize Gemini API
// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const bookRoomDeclaration: FunctionDeclaration = {
  name: 'bookRoom',
  description: 'Book a room for a guest. Use this ONLY when you have collected all required information from the guest.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      roomId: { type: Type.STRING, description: 'The ID of the room (e.g., "hn-standard")' },
      checkIn: { type: Type.STRING, description: 'Check-in date in YYYY-MM-DD format' },
      checkOut: { type: Type.STRING, description: 'Check-out date in YYYY-MM-DD format' },
      adults: { type: Type.NUMBER, description: 'Number of adults' },
      children: { type: Type.NUMBER, description: 'Number of children' },
      guestName: { type: Type.STRING, description: 'Full name of the guest' },
      guestEmail: { type: Type.STRING, description: 'Email address of the guest' },
    },
    required: ['roomId', 'checkIn', 'checkOut', 'adults', 'children', 'guestName', 'guestEmail']
  }
};

const bookExperienceDeclaration: FunctionDeclaration = {
  name: 'bookExperience',
  description: 'Book an experience for a guest. Use this ONLY when you have collected all required information from the guest.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      experienceId: { type: Type.STRING, description: 'The ID of the experience (e.g., "hcmc-dining")' },
      date: { type: Type.STRING, description: 'Date of the experience in YYYY-MM-DD format' },
      adults: { type: Type.NUMBER, description: 'Number of adults' },
      children: { type: Type.NUMBER, description: 'Number of children' },
      guestName: { type: Type.STRING, description: 'Full name of the guest' },
      guestEmail: { type: Type.STRING, description: 'Email address of the guest' },
    },
    required: ['experienceId', 'date', 'adults', 'children', 'guestName', 'guestEmail']
  }
};

const checkBookingDeclaration: FunctionDeclaration = {
  name: 'checkBooking',
  description: 'Check the details and status of a booking using the booking ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bookingId: { type: Type.STRING, description: 'The ID of the booking (e.g., "RES-123456789")' }
    },
    required: ['bookingId']
  }
};

const cancelBookingDeclaration: FunctionDeclaration = {
  name: 'cancelBooking',
  description: 'Cancel a booking using the booking ID. Use this ONLY when the guest explicitly requests to cancel their booking and provides the booking ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bookingId: { type: Type.STRING, description: 'The ID of the booking to cancel (e.g., "RES-123456789")' }
    },
    required: ['bookingId']
  }
};

const bookItineraryDeclaration: FunctionDeclaration = {
  name: 'bookItinerary',
  description: 'Book a complete itinerary including rooms and experiences all at once. Use this when the guest agrees to a proposed package.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      guestName: { type: Type.STRING, description: 'Full name of the guest' },
      guestEmail: { type: Type.STRING, description: 'Email address of the guest' },
      adults: { type: Type.NUMBER, description: 'Number of adults' },
      children: { type: Type.NUMBER, description: 'Number of children' },
      roomBookings: {
        type: Type.ARRAY,
        description: 'List of room bookings',
        items: {
          type: Type.OBJECT,
          properties: {
            roomId: { type: Type.STRING },
            checkIn: { type: Type.STRING },
            checkOut: { type: Type.STRING }
          },
          required: ['roomId', 'checkIn', 'checkOut']
        }
      },
      experienceBookings: {
        type: Type.ARRAY,
        description: 'List of experience bookings',
        items: {
          type: Type.OBJECT,
          properties: {
            experienceId: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ['experienceId', 'date']
        }
      }
    },
    required: ['guestName', 'guestEmail', 'adults', 'children']
  }
};

const updatePreferencesDeclaration: FunctionDeclaration = {
  name: 'updatePreferences',
  description: 'Save or update guest preferences, dietary restrictions, or special requests (e.g., allergies, room preferences). Call this whenever the guest mentions a preference.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      preferences: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of preferences to save' }
    },
    required: ['preferences']
  }
};

const requestRoomServiceDeclaration: FunctionDeclaration = {
  name: 'requestRoomService',
  description: 'Request in-stay services like room service (food), housekeeping (towels, cleaning), or maintenance. Use this when a guest is already staying at the hotel and needs something delivered to their room.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      roomNumber: { type: Type.STRING, description: 'The guest\'s room number' },
      serviceType: { type: Type.STRING, description: 'Type of service: "dining", "housekeeping", "maintenance", or "other"' },
      details: { type: Type.STRING, description: 'Specific details of the request (e.g., "2 extra towels", "1 bottle of champagne")' }
    },
    required: ['roomNumber', 'serviceType', 'details']
  }
};

const modifyBookingDeclaration: FunctionDeclaration = {
  name: 'modifyBooking',
  description: 'Modify an existing booking (change dates). Use this when a guest wants to change their check-in/check-out dates or experience date.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bookingId: { type: Type.STRING, description: 'The ID of the booking to modify' },
      newCheckIn: { type: Type.STRING, description: 'The new check-in date (YYYY-MM-DD)' },
      newCheckOut: { type: Type.STRING, description: 'The new check-out date (YYYY-MM-DD), optional for experiences' }
    },
    required: ['bookingId', 'newCheckIn']
  }
};

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

interface ChatbotProps {
  currentView?: string;
  viewParams?: string | null;
  onNavigate?: (view: any, payload?: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ currentView, viewParams, onNavigate }) => {
  const { addBooking, cancelBooking, modifyBooking, addServiceRequest, bookings } = useBooking();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const hour = new Date().getHours();
    let greetingVi = 'Kính chào quý khách';
    let greetingEn = 'Welcome';
    if (hour >= 5 && hour < 12) { greetingVi = 'Chào buổi sáng'; greetingEn = 'Good morning'; }
    else if (hour >= 12 && hour < 18) { greetingVi = 'Chào buổi chiều'; greetingEn = 'Good afternoon'; }
    else { greetingVi = 'Chào buổi tối'; greetingEn = 'Good evening'; }

    return [
      { role: 'model', text: `${greetingVi}! Tôi là Concierge cá nhân của Dat Valoir. Tôi có thể giúp gì cho kỳ nghỉ sắp tới của quý khách?\n\n*${greetingEn}! I am your Private Concierge at Dat Valoir. How may I assist you with your upcoming stay?*` }
    ];
  });

  const [apiHistory, setApiHistory] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [guestPreferences, setGuestPreferences] = useState<string[]>(() => {
    const stored = localStorage.getItem('datvaloir_guest_prefs');
    return stored ? JSON.parse(stored) : [];
  });

  const SUGGESTIONS = [
    "Gợi ý lịch trình trăng mật 3 ngày",
    "Các phòng có view biển",
    "Tôi muốn kiểm tra mã đặt phòng"
  ];

  // Dynamic context based on user login status
  const systemInstruction = `
You are the exclusive Private Concierge for "Dat Valoir", a luxury hotel brand.
Your tone is elegant, highly professional, polite, empathetic, and personalized. You speak like a high-end butler or concierge who deeply cares about the guest's experience.
You assist guests with room recommendations, amenities, locations, and general inquiries.

Persona Guidelines:
- Be highly empathetic and acknowledge the user's potential mood, needs, or situation.
- Use comforting and assuring phrases such as "I understand you're looking for...", "I'm here to help make your stay seamless", "That sounds like a wonderful occasion", or "I would be delighted to assist you with that."
- Personalize the conversation. Address the guest respectfully and tailor recommendations to their specific context.
- Maintain a warm, inviting, and luxurious demeanor at all times.
- If appropriate, use dynamic greetings based on the time of day (e.g., "Good morning", "Good evening").

Here is the factual information about our hotel locations:
${JSON.stringify(LOCATIONS)}

Here is the factual information about our rooms across all locations:
${JSON.stringify(ROOMS_DATA)}

Here is the factual information about our experiences and services:
${JSON.stringify(EXPERIENCES_DATA)}

${currentView ? `
IMPORTANT CONTEXT: The guest is currently viewing the "${currentView}" page.
${viewParams ? `They are specifically looking at item ID: "${viewParams}". If they ask "Does this room have..." or "How much is this experience?", they are referring to this item.` : ''}
Use this context to provide highly relevant answers without asking them to repeat what they are looking at.
` : ''}

${user ? `
IMPORTANT: The guest is currently LOGGED IN.
Their name is: ${user.name}
Their email is: ${user.email}
When they want to book a room or experience, DO NOT ask for their name or email. Use the provided name and email automatically.
` : `
IMPORTANT: The guest is NOT logged in.
When they want to book a room or experience, you MUST ask for their full name and email address before proceeding.
`}

Rules:
1. Only recommend rooms, locations, and experiences that exist in the provided data.
2. If a guest asks for a price, provide the exact price listed in the data.
3. Keep your responses concise, well-formatted (use markdown for bolding, lists, etc.), and easy to read.
4. Always be welcoming and offer further assistance to make their stay unforgettable.
5. You can communicate in both English and Vietnamese, depending on the user's language.
6. If a guest wants to book a room, you MUST ask for all required details: room ID (based on their preference), check-in date, check-out date, number of adults, number of children. ${!user ? 'Also ask for their full name and email address.' : ''} Once you have ALL this information, use the \`bookRoom\` tool to create the reservation.
7. If a guest wants to book an experience, you MUST ask for all required details: experience ID (based on their preference), date, number of adults, number of children. ${!user ? 'Also ask for their full name and email address.' : ''} Once you have ALL this information, use the \`bookExperience\` tool to create the reservation.
8. After a successful booking via the tool, inform the guest of their confirmation ID and total cost.
9. If a guest asks to check their booking, ask for their booking ID and use the \`checkBooking\` tool.
10. If a guest asks to cancel their booking, ask for their booking ID and use the \`cancelBooking\` tool.
11. GENERATIVE UI: To provide a luxurious visual experience, whenever you recommend specific rooms or experiences, you MUST include a special UI tag in your text.
- For rooms, use: [UI:ROOM:roomId1,roomId2] (e.g., [UI:ROOM:hn-standard,dn-ocean])
- For experiences, use: [UI:EXPERIENCE:expId1,expId2]
The system will automatically replace these tags with beautiful interactive UI cards. Always include these tags at the very end of your response.
12. ITINERARY PLANNER: If a guest asks for a trip, honeymoon, or vacation package, act as a travel architect. Propose a day-by-day itinerary combining a room and relevant experiences. When proposing, use BOTH [UI:ROOM:...] and [UI:EXPERIENCE:...] tags so the guest can see all recommended items visually. Once they approve the plan and provide dates and guest details, use the \`bookItinerary\` tool to book everything in one go.
13. If the guest mentions a preference, allergy, or special need, acknowledge it and use the \`updatePreferences\` tool to save it.
14. IN-STAY SERVICES: If a guest asks for room service (food/drinks), housekeeping (extra towels, pillows, cleaning), or maintenance, use the \`requestRoomService\` tool. Ask for their room number if they haven't provided it.
15. VISION: If the guest uploads an image, analyze it carefully. If it's a room style, recommend similar rooms we have. If it's food, recommend our dining experiences.

${guestPreferences.length > 0 ? `
IMPORTANT GUEST PREFERENCES:
The guest has the following saved preferences/restrictions:
${guestPreferences.map(p => `- ${p}`).join('\n')}
Always take these into account when making recommendations or booking (e.g., remind the restaurant about allergies).
` : ''}
`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToProcess?: string) => {
    const userMessage = typeof textToProcess === 'string' ? textToProcess.trim() : input.trim();
    if (!userMessage && !selectedImage || isLoading) return;

    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage, image: currentImage }]);
    setIsLoading(true);

    try {
      const currentParts: any[] = [];
      if (userMessage) {
        currentParts.push({ text: userMessage });
      }
      if (currentImage) {
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.split(';')[0].split(':')[1];
        currentParts.push({ inlineData: { data: base64Data, mimeType } });
      }
      
      let currentContents = [...apiHistory, { role: 'user', parts: currentParts }];

      let response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: currentContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          tools: [{ functionDeclarations: [bookRoomDeclaration, bookExperienceDeclaration, checkBookingDeclaration, cancelBookingDeclaration, bookItineraryDeclaration, updatePreferencesDeclaration, requestRoomServiceDeclaration, modifyBookingDeclaration] }]
        }
      });

      // Handle function calls
      while (response.functionCalls && response.functionCalls.length > 0) {
        // Add the model's function call to history
        currentContents.push(response.candidates![0].content);
        
        const functionResponsesParts: any[] = [];

        for (const call of response.functionCalls) {
          let functionResult;

          if (call.name === 'bookRoom') {
          const args = call.args as any;
          
          // Find room
          let foundRoom = null;
          let foundLocation = '';
          for (const [loc, rooms] of Object.entries(ROOMS_DATA)) {
            const room = rooms.find(r => r.id === args.roomId);
            if (room) {
              foundRoom = room;
              foundLocation = loc;
              break;
            }
          }

          if (!foundRoom) {
            functionResult = { success: false, error: 'Room ID not found.' };
          } else {
            // Calculate price
            const calculateNights = (start: string, end: string) => {
                if (!start || !end) return 0;
                const diff = new Date(end).getTime() - new Date(start).getTime();
                return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
            };
            const parsePrice = (priceString: string) => {
                if (!priceString) return 0;
                return parseInt(priceString?.replace(/[^0-9]/g, ''), 10);
            };
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
            };

            const nights = calculateNights(args.checkIn, args.checkOut);
            const basePrice = parsePrice(foundRoom.price);
            const roomTotal = basePrice * nights;
            const fee = roomTotal * 0.1; // 10% default service fee
            const totalCost = formatCurrency(roomTotal + fee);

            try {
              const newBooking = addBooking({
                type: 'ROOM',
                itemDetails: {
                    id: foundRoom.id,
                    name: foundRoom.name,
                    image: foundRoom.image,
                    location: foundLocation
                },
                dates: {
                    checkIn: args.checkIn,
                    checkOut: args.checkOut
                },
                guests: { adults: args.adults, children: args.children },
                totalPrice: totalCost,
                paymentMethod: 'pay_at_counter'
              }, args.guestEmail);

              if (!user) {
                const currentGuestIds = JSON.parse(localStorage.getItem('datvaloir_guest_ids') || '[]');
                if (!currentGuestIds.includes(newBooking.id)) {
                    currentGuestIds.push(newBooking.id);
                    localStorage.setItem('datvaloir_guest_ids', JSON.stringify(currentGuestIds));
                }
              }

              functionResult = { success: true, bookingId: newBooking.id, totalCost: totalCost };
            } catch (err: any) {
              functionResult = { success: false, error: err.message };
            }
          }
        } else if (call.name === 'bookExperience') {
          const args = call.args as any;
          
          // Find experience
          const foundExperience = EXPERIENCES_DATA.find(e => e.id === args.experienceId);

          if (!foundExperience) {
            functionResult = { success: false, error: 'Experience ID not found.' };
          } else {
            // Calculate price
            const parsePrice = (priceString: string) => {
                if (!priceString) return 0;
                return parseInt(priceString?.replace(/[^0-9]/g, ''), 10);
            };
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
            };

            const basePrice = parsePrice(foundExperience.price);
            const totalCost = basePrice > 0 ? formatCurrency(basePrice) : foundExperience.price;

            try {
              const newBooking = addBooking({
                type: 'EXPERIENCE',
                itemDetails: {
                    id: foundExperience.id,
                    name: foundExperience.title,
                    image: foundExperience.image,
                    location: foundExperience.location
                },
                dates: {
                    checkIn: args.date,
                    startTime: foundExperience.details?.startTime
                },
                guests: { adults: args.adults, children: args.children },
                totalPrice: totalCost,
                paymentMethod: 'pay_at_counter'
              }, args.guestEmail);

              if (!user) {
                const currentGuestIds = JSON.parse(localStorage.getItem('datvaloir_guest_ids') || '[]');
                if (!currentGuestIds.includes(newBooking.id)) {
                    currentGuestIds.push(newBooking.id);
                    localStorage.setItem('datvaloir_guest_ids', JSON.stringify(currentGuestIds));
                }
              }

              functionResult = { success: true, bookingId: newBooking.id, totalCost: totalCost };
            } catch (err: any) {
              functionResult = { success: false, error: err.message };
            }
          }
        } else if (call.name === 'checkBooking') {
          const args = call.args as any;
          const foundBooking = bookings.find(b => b.id === args.bookingId);
          
          if (!foundBooking) {
            functionResult = { success: false, error: 'Booking not found. Please check the ID.' };
          } else {
            // Basic security check: if logged in, only allow checking own bookings
            if (user && foundBooking.userId !== user.email && user.role !== 'ADMIN' && user.role !== 'STAFF') {
               functionResult = { success: false, error: 'You do not have permission to view this booking.' };
            } else {
               functionResult = { success: true, booking: foundBooking };
            }
          }
        } else if (call.name === 'cancelBooking') {
          const args = call.args as any;
          const foundBooking = bookings.find(b => b.id === args.bookingId);
          
          if (!foundBooking) {
            functionResult = { success: false, error: 'Booking not found. Please check the ID.' };
          } else if (foundBooking.status === 'CANCELLED') {
            functionResult = { success: false, error: 'This booking is already cancelled.' };
          } else {
            // Basic security check: if logged in, only allow cancelling own bookings
            if (user && foundBooking.userId !== user.email && user.role !== 'ADMIN' && user.role !== 'STAFF') {
               functionResult = { success: false, error: 'You do not have permission to cancel this booking.' };
            } else {
               try {
                 await cancelBooking(args.bookingId);
                 functionResult = { success: true, message: 'Booking cancelled successfully.' };
               } catch (err: any) {
                 functionResult = { success: false, error: err.message };
               }
            }
          }
        } else if (call.name === 'bookItinerary') {
          const args = call.args as any;
          let totalCostNum = 0;
          const newBookingIds: string[] = [];
          const errors: string[] = [];

          const parsePrice = (priceString: string) => {
              if (!priceString) return 0;
              return parseInt(priceString?.replace(/[^0-9]/g, ''), 10);
          };
          const formatCurrency = (amount: number) => {
              return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
          };

          if (args.roomBookings && Array.isArray(args.roomBookings)) {
            for (const rb of args.roomBookings) {
              let foundRoom = null;
              let foundLocation = '';
              for (const [loc, rooms] of Object.entries(ROOMS_DATA)) {
                const room = rooms.find(r => r.id === rb.roomId);
                if (room) { foundRoom = room; foundLocation = loc; break; }
              }
              if (foundRoom) {
                const diff = new Date(rb.checkOut).getTime() - new Date(rb.checkIn).getTime();
                const nights = Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
                const basePrice = parsePrice(foundRoom.price);
                const roomTotal = basePrice * nights;
                const fee = roomTotal * 0.1;
                totalCostNum += (roomTotal + fee);

                try {
                  const newBooking = addBooking({
                    type: 'ROOM',
                    itemDetails: { id: foundRoom.id, name: foundRoom.name, image: foundRoom.image, location: foundLocation },
                    dates: { checkIn: rb.checkIn, checkOut: rb.checkOut },
                    guests: { adults: args.adults, children: args.children },
                    totalPrice: formatCurrency(roomTotal + fee),
                    paymentMethod: 'pay_at_counter'
                  }, args.guestEmail);
                  newBookingIds.push(newBooking.id);
                } catch (e: any) { errors.push(e.message); }
              } else {
                errors.push(`Room ${rb.roomId} not found`);
              }
            }
          }

          if (args.experienceBookings && Array.isArray(args.experienceBookings)) {
            for (const eb of args.experienceBookings) {
              const foundExperience = EXPERIENCES_DATA.find(e => e.id === eb.experienceId);
              if (foundExperience) {
                const basePrice = parsePrice(foundExperience.price);
                totalCostNum += basePrice;
                try {
                  const newBooking = addBooking({
                    type: 'EXPERIENCE',
                    itemDetails: { id: foundExperience.id, name: foundExperience.title, image: foundExperience.image, location: foundExperience.location },
                    dates: { checkIn: eb.date, startTime: foundExperience.details?.startTime },
                    guests: { adults: args.adults, children: args.children },
                    totalPrice: basePrice > 0 ? formatCurrency(basePrice) : foundExperience.price,
                    paymentMethod: 'pay_at_counter'
                  }, args.guestEmail);
                  newBookingIds.push(newBooking.id);
                } catch (e: any) { errors.push(e.message); }
              } else {
                errors.push(`Experience ${eb.experienceId} not found`);
              }
            }
          }

          if (!user && newBookingIds.length > 0) {
            const currentGuestIds = JSON.parse(localStorage.getItem('datvaloir_guest_ids') || '[]');
            const updatedGuestIds = [...new Set([...currentGuestIds, ...newBookingIds])];
            localStorage.setItem('datvaloir_guest_ids', JSON.stringify(updatedGuestIds));
          }

          if (errors.length > 0) {
            functionResult = { success: false, error: errors.join('; '), partialBookings: newBookingIds };
          } else {
            functionResult = { success: true, bookingIds: newBookingIds, totalCost: formatCurrency(totalCostNum), message: 'Itinerary booked successfully.' };
          }
        } else if (call.name === 'updatePreferences') {
          const args = call.args as any;
          if (args.preferences && Array.isArray(args.preferences)) {
            const newPrefs = [...new Set([...guestPreferences, ...args.preferences])];
            setGuestPreferences(newPrefs);
            localStorage.setItem('datvaloir_guest_prefs', JSON.stringify(newPrefs));
            functionResult = { success: true, message: 'Preferences updated successfully.' };
          } else {
            functionResult = { success: false, error: 'Invalid preferences format.' };
          }
        } else if (call.name === 'requestRoomService') {
          const args = call.args as any;
          try {
            const request = addServiceRequest({
              roomNumber: args.roomNumber,
              serviceType: args.serviceType,
              details: args.details
            });
            functionResult = { 
              success: true, 
              requestId: request.id,
              message: `Request for "${args.details}" has been sent to ${args.serviceType} department for room ${args.roomNumber}. It will be handled shortly.` 
            };
          } catch (e: any) {
            functionResult = { success: false, error: e.message };
          }
          } else if (call.name === 'modifyBooking') {
            const args = call.args as any;
            const booking = bookings.find(b => b.id === args.bookingId);
            if (booking) {
              try {
                await modifyBooking(args.bookingId, {
                  checkIn: args.newCheckIn,
                  checkOut: args.newCheckOut || booking.dates.checkOut,
                  startTime: booking.dates.startTime
                });
                functionResult = { success: true, message: `Booking ${args.bookingId} modified successfully. New dates: ${args.newCheckIn} to ${args.newCheckOut || 'N/A'}.` };
              } catch (e: any) {
                functionResult = { success: false, error: e.message };
              }
            } else {
              functionResult = { success: false, error: `Booking ID ${args.bookingId} not found.` };
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

        // Send function response back to model
        currentContents.push({
          role: 'user',
          parts: functionResponsesParts
        });

        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: currentContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            tools: [{ functionDeclarations: [bookRoomDeclaration, bookExperienceDeclaration, checkBookingDeclaration, cancelBookingDeclaration, bookItineraryDeclaration, updatePreferencesDeclaration, requestRoomServiceDeclaration, modifyBookingDeclaration] }]
          }
        });
      }

      const responseText = response.text;
      if (responseText) {
        currentContents.push({ role: 'model', parts: [{ text: responseText }] });
        setApiHistory(currentContents);
        setMessages(prev => [...prev, { role: 'model', text: responseText as string }]);
      } else {
        currentContents.push({ role: 'model', parts: [{ text: 'Đã xử lý yêu cầu của quý khách thành công.' }] });
        setApiHistory(currentContents);
        setMessages(prev => [...prev, { role: 'model', text: 'Đã xử lý yêu cầu của quý khách thành công.' }]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Xin lỗi quý khách, hệ thống của tôi đang gặp chút gián đoạn. Lỗi: ${(error as Error).message}` }]);
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
    let roomIds: string[] = [];
    let expIds: string[] = [];

    const roomRegex = /\[UI:ROOM:([a-zA-Z0-9,\s-]+)\]/g;
    let match;
    while ((match = roomRegex.exec(text)) !== null) {
      roomIds.push(...match[1].split(','));
      cleanText = cleanText.replace(match[0], '');
    }

    const expRegex = /\[UI:EXPERIENCE:([a-zA-Z0-9,\s-]+)\]/g;
    while ((match = expRegex.exec(text)) !== null) {
      expIds.push(...match[1].split(','));
      cleanText = cleanText.replace(match[0], '');
    }

    const findRoomById = (id: string) => {
      for (const loc of Object.values(ROOMS_DATA)) {
        const room = loc.find(r => r.id === id);
        if (room) return room;
      }
      return null;
    };

    return (
      <div className="flex flex-col gap-3">
        <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-yellow-500">
          <Markdown>{cleanText}</Markdown>
        </div>
        
        {roomIds.length > 0 && (
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {roomIds.map(id => {
              const room = findRoomById(id.trim());
              if (!room) return null;
              return (
                <div 
                  key={id} 
                  className="min-w-[220px] w-[220px] bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-lg snap-start shrink-0 group hover:border-yellow-500/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate && onNavigate('ROOM_DETAIL', room.id)}
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                      <span className="text-xs font-bold text-white truncate pr-2">{room.name}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-yellow-500 text-sm font-semibold">{room.price}<span className="text-[10px] text-gray-400 font-normal">/đêm</span></p>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {room.amenities.slice(0, 2).map((amenity, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded-sm text-gray-300">{amenity}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {expIds.length > 0 && (
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {expIds.map(id => {
              const exp = EXPERIENCES_DATA.find(e => e.id === id.trim());
              if (!exp) return null;
              return (
                <div 
                  key={id} 
                  className="min-w-[220px] w-[220px] bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-lg snap-start shrink-0 group hover:border-yellow-500/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate && onNavigate('EXPERIENCE_DETAIL', exp.id)}
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-xs font-bold text-white line-clamp-2">{exp.title}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-yellow-500 text-sm font-semibold">{exp.price}</p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{exp.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-110 transition-transform duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open Chat"
      >
        <MessageSquare size={24} className="text-black" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-[100] w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-900/40 to-black p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-black" />
            </div>
            <div>
              <h3 className="text-white font-bold font-['Playfair_Display'] text-lg leading-tight">Dat Valoir</h3>
              <p className="text-yellow-500 text-xs uppercase tracking-widest">Private Concierge</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-yellow-600 to-yellow-500 text-black rounded-tr-sm'
                    : 'bg-[#141414] text-gray-200 rounded-tl-sm border border-white/5 shadow-lg'
                }`}
              >
                {msg.role === 'model' ? (
                  renderMessageContent(msg.text)
                ) : (
                  <>
                    {msg.image && <img src={msg.image} alt="Upload" className="max-w-full h-auto rounded-lg mb-2 border border-white/10" />}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="text-yellow-500 animate-spin" />
                <span className="text-xs text-gray-400">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black shrink-0">
          {messages.length === 1 && (
            <div className="pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  disabled={isLoading}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
          <div className="relative flex items-center gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-yellow-500 transition-colors shrink-0">
              <ImageIcon size={20} />
            </button>
            <div className="relative flex-1 flex flex-col">
              {selectedImage && (
                <div className="absolute bottom-full mb-2 left-0 relative inline-block w-max">
                  <img src={selectedImage} alt="Preview" className="h-16 rounded-md border border-white/20 object-cover" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-black rounded-full text-white hover:text-red-500"><XCircle size={16}/></button>
                </div>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Hỏi tôi về phòng, dịch vụ..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all resize-none h-[46px] scrollbar-none"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute right-1.5 bottom-1.5 w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
