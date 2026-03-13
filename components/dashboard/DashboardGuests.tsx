
import React, { useState, useMemo } from 'react';
import { User, Mail, Award, MapPin, X, Calendar } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DashboardGuests: React.FC = () => {
    const { bookings } = useBooking();
    const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

    // --- DERIVE GUEST LIST ---
    const guests = useMemo(() => {
        const guestMap = new Map();

        bookings.forEach(b => {
            if (!guestMap.has(b.userId)) {
                guestMap.set(b.userId, {
                    email: b.userId,
                    name: b.userId.split('@')[0], // Mock name derivation
                    bookingsCount: 0,
                    totalSpent: 0,
                    lastVisit: b.bookedAt,
                    status: 'Member'
                });
            }
            
            const guest = guestMap.get(b.userId);
            guest.bookingsCount += 1;
            guest.totalSpent += parseInt(b.totalPrice?.replace(/[^0-9]/g, '') || '0', 10);
            if (new Date(b.bookedAt) > new Date(guest.lastVisit)) {
                guest.lastVisit = b.bookedAt;
            }
        });

        // Determine Status based on Spend
        return Array.from(guestMap.values()).map(g => ({
            ...g,
            status: g.totalSpent > 5000 ? 'Platinum' : g.totalSpent > 2000 ? 'Gold' : 'Member'
        })).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by highest spenders (VIPs first)

    }, [bookings]);

    const guestBookings = useMemo(() => {
        if (!selectedGuest) return [];
        return bookings.filter(b => b.userId === selectedGuest).sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
    }, [bookings, selectedGuest]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'CONFIRMED': return <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
            case 'CANCELLED': return <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
            case 'COMPLETED': return <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">Completed</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
                <h2 className="text-xl font-['Playfair_Display'] text-white">Guest Directory</h2>
                <div className="text-xs text-gray-500">Total Unique Guests: <span className="text-white font-bold">{guests.length}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {guests.map((guest) => (
                    <div key={guest.email} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 hover:border-yellow-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-yellow-500 group-hover:border-yellow-500 transition-all">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold capitalize">{guest.name?.replace('.', ' ')}</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                        <Mail size={10} /> {guest.email}
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                guest.status === 'Platinum' ? 'bg-indigo-900/20 text-indigo-300 border-indigo-500/30' :
                                guest.status === 'Gold' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500/30' :
                                'bg-gray-800 text-gray-400 border-gray-700'
                            }`}>
                                {guest.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Spend</div>
                                <div className="text-lg font-mono text-luxury-gold">{formatCurrency(guest.totalSpent)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Stays</div>
                                <div className="text-lg font-mono text-white">{guest.bookingsCount}</div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                             <div className="text-gray-500 flex items-center gap-2">
                                <Award size={12} className={guest.totalSpent > 0 ? "text-yellow-600" : "text-gray-700"} />
                                <span>Lifetime Value</span>
                             </div>
                             <button 
                                onClick={() => setSelectedGuest(guest.email)}
                                className="text-white hover:text-yellow-500 underline decoration-gray-700 hover:decoration-yellow-500 transition-all"
                             >
                                 View History
                             </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- VIEW HISTORY MODAL --- */}
            {selectedGuest && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedGuest(null)}></div>
                    <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-3xl rounded-xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out] max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-['Playfair_Display'] text-white">Booking History</h3>
                                <p className="text-sm text-gray-500">{selectedGuest}</p>
                            </div>
                            <button onClick={() => setSelectedGuest(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                            {guestBookings.length === 0 ? (
                                <div className="text-center p-8 text-gray-500">No booking history available.</div>
                            ) : (
                                guestBookings.map(booking => (
                                    <div key={booking.id} className="bg-[#111] border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div className="flex items-center gap-4">
                                            <img src={booking.itemDetails.image} alt={booking.itemDetails.name} className="w-16 h-16 object-cover rounded border border-white/10" />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-bold">{booking.type}</span>
                                                    <span className="text-xs text-gray-500 font-mono">{booking.id}</span>
                                                </div>
                                                <h4 className="text-white font-bold">{booking.itemDetails.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                    <Calendar size={12} className="text-yellow-600/70" />
                                                    {booking.dates.checkIn} {booking.dates.checkOut && `— ${booking.dates.checkOut}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                            <div className="text-lg font-mono text-white">{booking.totalPrice}</div>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardGuests;
