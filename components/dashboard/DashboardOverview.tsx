
import React, { useMemo } from 'react';
import { Activity, ConciergeBell, Clock, DollarSign, CheckCircle, ShieldAlert, TrendingUp, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { ROOMS_DATA } from '../../constants';

// Helper for currency
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

interface DashboardOverviewProps {
    onNavigateToBookings: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateToBookings }) => {
    const { bookings, serviceRequests } = useBooking();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    // --- DERIVED ANALYTICS (Real-time calculation) ---
    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Revenue
        const totalRevenue = bookings
            .filter(b => b.status !== 'CANCELLED')
            .reduce((acc, curr) => {
                const price = parseInt(curr.totalPrice?.replace(/[^0-9]/g, '') || '0', 10);
                return acc + price;
            }, 0);

        // 2. Occupancy
        const totalRooms = Object.values(ROOMS_DATA).reduce((acc, rooms) => acc + rooms.length, 0);
        const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' && b.type === 'ROOM').length;
        const occupancyRate = totalRooms > 0 ? Math.min(100, Math.round((activeBookings / totalRooms) * 100)) : 0;

        // 3. Today Arrivals
        const arrivals = bookings.filter(b => b.dates.checkIn === today && b.status === 'CONFIRMED').length;

        // 4. Pending/Recent
        const pending = bookings.filter(b => b.status === 'CONFIRMED').length; // Treating confirmed as "active/pending service"

        // 5. Location Occupancy
        const locationOccupancy = {
            hanoi: { active: 0, total: ROOMS_DATA.hanoi?.length || 0 },
            danang: { active: 0, total: ROOMS_DATA.danang?.length || 0 },
            hcmc: { active: 0, total: ROOMS_DATA.hcmc?.length || 0 }
        };

        bookings.forEach(b => {
            if (b.status === 'CONFIRMED' && b.type === 'ROOM') {
                for (const [loc, rooms] of Object.entries(ROOMS_DATA)) {
                    if (rooms.some(r => r.id === b.itemDetails.id)) {
                        const key = loc as keyof typeof locationOccupancy;
                        if (locationOccupancy[key]) {
                            locationOccupancy[key].active++;
                        }
                        break;
                    }
                }
            }
        });

        const getOccPct = (loc: keyof typeof locationOccupancy) => {
            const data = locationOccupancy[loc];
            return data.total > 0 ? Math.min(100, Math.round((data.active / data.total) * 100)) : 0;
        };

        const pendingServiceRequests = serviceRequests.filter(req => req.status === 'PENDING').length;

        return { 
            totalRevenue, 
            occupancyRate, 
            arrivals, 
            pending,
            pendingServiceRequests,
            hanoiOcc: getOccPct('hanoi'),
            danangOcc: getOccPct('danang'),
            hcmcOcc: getOccPct('hcmc')
        };
    }, [bookings, serviceRequests]);

    const STAT_CARDS = [
        { 
            label: 'Active Occupancy', 
            value: `${stats.occupancyRate}%`, 
            icon: <Activity size={20} />, 
            trend: 'Live', 
            color: 'text-green-400',
            bg: 'bg-green-500/10' 
        },
        { 
            label: 'Arrivals Today', 
            value: stats.arrivals.toString().padStart(2, '0'), 
            icon: <ConciergeBell size={20} />, 
            trend: 'Check Front Desk', 
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10'
        },
        { 
            label: 'Active Reservations', 
            value: stats.pending.toString().padStart(2, '0'), 
            icon: <Clock size={20} />, 
            trend: 'Upcoming', 
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Pending Requests',
            value: stats.pendingServiceRequests.toString().padStart(2, '0'),
            icon: <ConciergeBell size={20} />,
            trend: 'Action Required',
            color: 'text-red-400',
            bg: 'bg-red-500/10'
        },
        ...(isAdmin ? [{ 
            label: 'YTD Revenue', 
            value: formatCurrency(stats.totalRevenue), 
            icon: <DollarSign size={20} />, 
            trend: '+18% vs Last Year', 
            color: 'text-luxury-gold',
            bg: 'bg-yellow-900/20'
        }] : [])
    ];

    const recentBookings = bookings.slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STAT_CARDS.map((stat, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-xl hover:border-white/20 transition-all cursor-default group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/5 ${stat.color}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1 text-white">{stat.value}</h3>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold font-['Playfair_Display'] text-white">Recent Booking Activity</h3>
                            <p className="text-xs text-gray-500 mt-1">Real-time updates from the reservation engine.</p>
                        </div>
                        <button 
                            onClick={onNavigateToBookings}
                            className="text-xs text-yellow-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                        {recentBookings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No recent activity detected.</div>
                        ) : (
                            recentBookings.map((booking, i) => (
                                <div key={booking.id} className="p-4 sm:p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {booking.status === 'CONFIRMED' ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">
                                                    {booking.status === 'CONFIRMED' ? 'New Reservation Confirmed' : 'Reservation Cancelled'}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-500">{new Date(booking.bookedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2">
                                                <span className="text-white font-medium">{booking.itemDetails.name}</span> for <span className="text-white">{booking.userId}</span>
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider">
                                                <span>ID: {booking.id}</span>
                                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                <span>{booking.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1a1500] to-[#0a0a0a] border border-yellow-900/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold font-['Playfair_Display'] mb-4 text-luxury-gold relative z-10">House Status</h3>
                        
                        <div className="space-y-4 relative z-10">
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Hanoi Suites</span>
                                    <span className="text-white font-bold">{stats.hanoiOcc}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-600 transition-all duration-1000" style={{ width: `${stats.hanoiOcc}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Da Nang Villas</span>
                                    <span className="text-white font-bold">{stats.danangOcc}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${stats.danangOcc}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Saigon Penthouses</span>
                                    <span className="text-white font-bold">{stats.hcmcOcc}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.hcmcOcc}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp size={18} className="text-green-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Performance</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Revenue is trending <span className="text-green-400 font-bold">18% higher</span> than the projected forecast for this quarter. High demand for the Da Nang Ocean Villas is driving the growth.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardOverview;
