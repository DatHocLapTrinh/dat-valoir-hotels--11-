
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS_OF_WEEK = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

interface CalendarPopupProps {
  selectedDate: string;
  onChange: (date: string) => void;
  minDate?: string;
  className?: string;
  arrowPosition?: string;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ selectedDate, onChange, minDate, className, arrowPosition }) => {
  const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); 
  };

  const handleNextMonth = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); 
  };

  const handleDateClick = (e: React.MouseEvent, day: number) => { 
    e.stopPropagation(); 
    // Create date in local time to avoid timezone offsets causing "previous day" bugs
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); 
    // Adjust for timezone offset to ensure ISO string matches the selected calendar date
    const offset = newDate.getTimezoneOffset(); 
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000)); 
    onChange(adjustedDate.toISOString().split('T')[0]); 
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const blankDays = Array(firstDay).fill(null);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isDateDisabled = (day: number) => { 
    if (!minDate) return false; 
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); 
    const min = new Date(minDate); 
    // Compare only dates, reset hours
    checkDate.setHours(0,0,0,0); 
    min.setHours(0,0,0,0); 
    return checkDate < min; 
  };

  const isSelected = (day: number) => { 
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); 
    const selected = new Date(selectedDate); 
    return checkDate.toDateString() === selected.toDateString(); 
  };

  const monthYearString = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`absolute bg-[#0a0a0a]/95 backdrop-blur-2xl text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 z-[60] border border-white/10 animate-[showContent_0.2s_ease-out] cursor-default w-[320px] ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} className="text-gray-300" /></button>
            <span className="font-['Playfair_Display'] font-bold text-lg text-yellow-500 capitalize">{monthYearString}</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} className="text-gray-300" /></button>
        </div>
        <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map(d => (
                <div key={d} className="text-center text-xs text-gray-500 font-bold tracking-wider">{d}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
            {blankDays.map((_, i) => <div key={`blank-${i}`} />)}
            {currentDays.map(day => { 
                const disabled = isDateDisabled(day); 
                const selected = isSelected(day); 
                return (
                    <button 
                        key={day} 
                        disabled={disabled} 
                        onClick={(e) => handleDateClick(e, day)} 
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 
                            ${selected ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110' : ''} 
                            ${!disabled && !selected ? 'text-gray-300 hover:bg-white/10 hover:text-white' : ''} 
                            ${disabled ? 'text-gray-700 cursor-not-allowed opacity-50' : ''}`
                        }
                    >
                        {day}
                    </button>
                )
            })}
        </div>
        {arrowPosition && (
             <div className={`absolute w-4 h-4 bg-[#0a0a0a] transform rotate-45 border-r border-b border-white/10 ${arrowPosition}`}></div>
        )}
    </div>
  );
};

export default CalendarPopup;
