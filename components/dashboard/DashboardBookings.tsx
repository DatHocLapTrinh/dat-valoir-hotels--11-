
import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, MoreHorizontal, XCircle, Check, AlertCircle } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DashboardBookings: React.FC = () => {
    const { bookings, cancelBooking, updateBookingStatus } = useBooking();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        return bookings.filter(b => {
            const matchesSearch = 
                b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.itemDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
    }, [bookings, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Reset page on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const handleCancel = async (id: string) => {
        await cancelBooking(id);
        setConfirmId(null);
    };

    const handleComplete = async (id: string) => {
        await updateBookingStatus(id, 'COMPLETED');
    };

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
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search booking ID, guest email or room name..." 
                        className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    {['ALL', 'CONFIRMED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs text-gray-400 uppercase tracking-widest">
                                <th className="p-4 font-bold">Booking ID</th>
                                <th className="p-4 font-bold">Guest</th>
                                <th className="p-4 font-bold">Item Details</th>
                                <th className="p-4 font-bold">Dates</th>
                                <th className="p-4 font-bold">Total</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-500 text-sm">
                                        No bookings found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-xs font-mono text-gray-400">{booking.id}</td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-white">{booking.userId}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{booking.guests.adults} Adl, {booking.guests.children} Chd</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={booking.itemDetails.image} className="w-10 h-10 rounded object-cover border border-white/10" alt="Thumb" />
                                                <div>
                                                    <div className="text-sm text-white font-medium">{booking.itemDetails.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">{booking.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-yellow-600"/>
                                                {booking.dates.checkIn}
                                            </div>
                                            {booking.dates.checkOut && <div className="ml-5 text-gray-500">to {booking.dates.checkOut}</div>}
                                            {booking.dates.startTime && <div className="ml-5 text-gray-500">@ {booking.dates.startTime}</div>}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-luxury-gold">{booking.totalPrice}</td>
                                        <td className="p-4">{getStatusBadge(booking.status)}</td>
                                        <td className="p-4 text-right">
                                            {booking.status === 'CONFIRMED' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {confirmId === booking.id ? (
                                                        <div className="flex items-center gap-2 bg-red-900/20 p-1 rounded border border-red-500/30">
                                                            <span className="text-[10px] text-red-400 px-1">Cancel?</span>
                                                            <button onClick={() => handleCancel(booking.id)} className="p-1 bg-red-600 rounded text-white hover:bg-red-500"><Check size={12} /></button>
                                                            <button onClick={() => setConfirmId(null)} className="p-1 bg-gray-700 rounded text-gray-300 hover:bg-gray-600"><XCircle size={12} /></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => handleComplete(booking.id)}
                                                                className="text-xs text-blue-500 hover:text-blue-400 underline decoration-transparent hover:decoration-blue-400 transition-all mr-2"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmId(booking.id)}
                                                                className="text-xs text-gray-500 hover:text-red-400 underline decoration-transparent hover:decoration-red-400 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing {paginatedData.length} of {filteredData.length} records</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1 text-white">Page {currentPage} of {totalPages || 1}</span>
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0} 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardBookings;
