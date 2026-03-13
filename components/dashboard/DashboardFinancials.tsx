
import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, CreditCard } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DashboardFinancials: React.FC = () => {
    const { bookings } = useBooking();

    // --- WORLD-CLASS ANALYTICS ENGINE (Client-Side) ---
    // In a real production app, this heavy logic would live on the backend.
    // Here, we simulate a robust calculation engine based on the `bookings` array.

    const analytics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalRevenue = 0;
        let totalRevenuePrevMonth = 0;
        
        let totalNightsSold = 0;
        let totalNightsSoldPrevMonth = 0;

        let totalBookings = 0;
        let totalBookingsPrevMonth = 0;
        
        let cancelledBookings = 0;
        let cancelledBookingsPrevMonth = 0;

        // Payment Method Stats
        const paymentMethods = {
            credit_card: 0,
            bank_transfer: 0,
            pay_at_counter: 0
        };

        // Monthly Distribution (for Chart) - Initialize 12 months with 0
        const monthlyRevenue = new Array(12).fill(0);

        bookings.forEach(b => {
            const bookingDate = new Date(b.bookedAt);
            const bookingMonth = bookingDate.getMonth();
            const bookingYear = bookingDate.getFullYear();
            
            // Parse Price (Remove currency symbols)
            const price = parseInt(b.totalPrice?.replace(/[^0-9]/g, '') || '0', 10);
            
            // Track Payment Method
            if (b.paymentMethod && paymentMethods[b.paymentMethod] !== undefined) {
                paymentMethods[b.paymentMethod]++;
            } else {
                 // Fallback for old data without payment method
                 paymentMethods['credit_card']++;
            }

            // --- ALL TIME STATS ---
            totalBookings++;
            if (b.status === 'CANCELLED') {
                cancelledBookings++;
            } else {
                totalRevenue += price;
                // Calculate nights (Fallback to 1 if Experience or data missing)
                let nights = 1;
                if (b.type === 'ROOM' && b.dates.checkOut) {
                    const start = new Date(b.dates.checkIn).getTime();
                    const end = new Date(b.dates.checkOut).getTime();
                    const diff = Math.ceil((end - start) / (1000 * 3600 * 24));
                    nights = diff > 0 ? diff : 1;
                }
                totalNightsSold += nights;

                // Populate Chart Data (Revenue by Month for Current Year)
                if (bookingYear === currentYear) {
                    monthlyRevenue[bookingMonth] += price;
                }
            }

            // --- PREVIOUS MONTH STATS (For Trend Calculation) ---
            // Logic: Check if booking belongs to (Current Month - 1)
            const isPrevMonth = (currentMonth === 0) 
                ? (bookingMonth === 11 && bookingYear === currentYear - 1) 
                : (bookingMonth === currentMonth - 1 && bookingYear === currentYear);

            if (isPrevMonth) {
                totalBookingsPrevMonth++;
                if (b.status === 'CANCELLED') {
                    cancelledBookingsPrevMonth++;
                } else {
                    totalRevenuePrevMonth += price;
                    let nights = 1; // Simplification for prev month logic
                    if (b.type === 'ROOM' && b.dates.checkOut) {
                         const start = new Date(b.dates.checkIn).getTime();
                         const end = new Date(b.dates.checkOut).getTime();
                         const diff = Math.ceil((end - start) / (1000 * 3600 * 24));
                         nights = diff > 0 ? diff : 1;
                    }
                    totalNightsSoldPrevMonth += nights;
                }
            }
        });

        // --- CALCULATE KPIs ---
        
        // 1. ADR (Average Daily Rate)
        // Formula: Total Room Revenue / Total Rooms Sold (Nights)
        const adr = totalNightsSold > 0 ? Math.round(totalRevenue / totalNightsSold) : 0;
        const adrPrev = totalNightsSoldPrevMonth > 0 ? Math.round(totalRevenuePrevMonth / totalNightsSoldPrevMonth) : 0;
        
        // 2. Cancellation Rate
        const cancelRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
        const cancelRatePrev = totalBookingsPrevMonth > 0 ? (cancelledBookingsPrevMonth / totalBookingsPrevMonth) * 100 : 0;

        // 3. Growth Percentages
        const calculateGrowth = (current: number, prev: number) => {
            if (prev === 0) return current > 0 ? 100 : 0; // 100% growth if started from 0
            return ((current - prev) / prev) * 100;
        };

        const revenueGrowth = calculateGrowth(totalRevenue, totalRevenuePrevMonth * 12); // *12 to simulate annualized vs total, or just use month vs month. 
        // Let's use Month vs Month for trends to be realistic
        // NOTE: For the "Total Gross Revenue" card, showing "All Time" is better, but trend should be "This Month vs Last".
        // Let's refine: The big number is ALL TIME. The trend is meaningless if comparing All Time vs Last Month.
        // Let's make the trend strictly based on current month activity vs last month.
        
        // Re-calculate current month revenue for trend
        const currentMonthRevenue = monthlyRevenue[currentMonth];
        const monthlyGrowth = calculateGrowth(currentMonthRevenue, totalRevenuePrevMonth);

        return {
            totalRevenue,
            adr,
            cancelRate,
            revenueGrowth: monthlyGrowth,
            adrGrowth: calculateGrowth(adr, adrPrev),
            cancelRateDiff: cancelRate - cancelRatePrev, // Percentage point difference
            monthlyData: monthlyRevenue,
            paymentMethods
        };

    }, [bookings]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
    const formatPct = (val: number) => `${Math.abs(val).toFixed(1)}%`;

    // Calculate max value for chart scaling
    const maxChartVal = Math.max(...analytics.monthlyData, 1000);

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s]">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* REVENUE CARD */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={100} className="text-luxury-gold"/></div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Total Gross Revenue</h3>
                    <div className="text-4xl font-['Playfair_Display'] text-white mb-4">{formatCurrency(analytics.totalRevenue)}</div>
                    <div className={`flex items-center gap-2 text-xs ${analytics.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{analytics.revenueGrowth >= 0 ? '+' : ''}{formatPct(analytics.revenueGrowth)} vs last month</span>
                    </div>
                </div>

                {/* ADR CARD */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><PieChart size={100} className="text-blue-500"/></div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Avg. Daily Rate (ADR)</h3>
                    <div className="text-4xl font-['Playfair_Display'] text-white mb-4">{formatCurrency(analytics.adr)}</div>
                    <div className={`flex items-center gap-2 text-xs ${analytics.adrGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.adrGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{analytics.adrGrowth >= 0 ? '+' : ''}{formatPct(analytics.adrGrowth)} vs prev month</span>
                    </div>
                </div>

                {/* CANCELLATION CARD */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingDown size={100} className="text-red-500"/></div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Cancellation Rate</h3>
                    <div className="text-4xl font-['Playfair_Display'] text-white mb-4">{analytics.cancelRate.toFixed(1)}%</div>
                    <div className={`flex items-center gap-2 text-xs ${analytics.cancelRateDiff <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                         {/* Lower cancellation is better (Green) */}
                        {analytics.cancelRateDiff <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                        <span>{Math.abs(analytics.cancelRateDiff).toFixed(1)}% {analytics.cancelRateDiff <= 0 ? 'improvement' : 'increase'}</span>
                    </div>
                </div>
            </div>

            {/* Revenue Chart (Dynamic) */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Revenue Performance ({new Date().getFullYear()})</h3>
                        <p className="text-xs text-gray-500">Real-time monthly breakdown based on booked dates</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                             <span className="w-3 h-3 bg-white/20 rounded-sm"></span>
                            <span className="text-gray-400">Actual Revenue</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 relative pt-6 border-b border-white/10">
                     {/* Y-Axis Lines (Background) */}
                     <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                         <div className="border-t border-white/50 w-full h-0"></div>
                         <div className="border-t border-white/30 w-full h-0"></div>
                         <div className="border-t border-white/30 w-full h-0"></div>
                         <div className="border-t border-white/30 w-full h-0"></div>
                     </div>

                    {analytics.monthlyData.map((val, i) => {
                        const heightPct = maxChartVal > 0 ? Math.max(2, (val / maxChartVal) * 100) : 2; // Min 2% height
                        const isFuture = i > new Date().getMonth();
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                {/* Tooltip */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold py-1 px-2 rounded mb-2 whitespace-nowrap z-10 shadow-xl">
                                    {formatCurrency(val)}
                                </div>
                                
                                {/* Bar */}
                                <div 
                                    className={`w-full max-w-[40px] transition-all duration-500 rounded-t-sm relative overflow-hidden ${isFuture ? 'bg-white/5' : 'bg-white/10 group-hover:bg-luxury-gold'}`}
                                    style={{ height: `${heightPct}%` }}
                                >
                                    {!isFuture && (
                                        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-yellow-600/20 to-transparent opacity-50"></div>
                                    )}
                                </div>
                                
                                {/* Label */}
                                <div className={`mt-4 text-[10px] font-mono uppercase ${i === new Date().getMonth() ? 'text-yellow-500 font-bold' : 'text-gray-600'}`}>
                                    {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Recent Transactions (Table) with Payment Method */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Recent Transactions</h3>
                    
                    {/* Payment Method Distribution Mini-Stats */}
                    <div className="hidden sm:flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div> Credit Card ({analytics.paymentMethods.credit_card})
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                             <div className="w-2 h-2 rounded-full bg-green-500"></div> Bank Transfer ({analytics.paymentMethods.bank_transfer})
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Guest</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Method</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 text-xs">No transactions recorded yet.</td>
                                </tr>
                            ) : (
                                bookings.slice(0, 5).map(b => (
                                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-gray-400">TX-{b.id.split('-')[1]}</td>
                                        <td className="p-4 text-white font-medium">{b.userId}</td>
                                        <td className="p-4 text-gray-400">{new Date(b.bookedAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-400 flex items-center gap-2 capitalize">
                                            <div className={`w-2 h-2 rounded-full ${
                                                b.paymentMethod === 'bank_transfer' ? 'bg-green-500' :
                                                b.paymentMethod === 'pay_at_counter' ? 'bg-yellow-500' : 
                                                'bg-blue-500'
                                            }`}></div> 
                                            {b.paymentMethod ? b.paymentMethod.replace(/_/g, ' ') : 'Credit Card'}
                                        </td>
                                        <td className="p-4 text-right text-luxury-gold font-mono">{b.totalPrice}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default DashboardFinancials;
