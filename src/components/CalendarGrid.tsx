
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
    currentDate: Date;
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    onMonthChange: (date: Date) => void;
    slotsData?: { date: string, status: 'full' | 'available' | 'none' }[]; // Optional indicator
}

export function CalendarGrid({ currentDate, selectedDate, onDateSelect, onMonthChange }: CalendarGridProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const nextMonth = () => onMonthChange(addDays(monthStart, 32)); // Jump safely to next month
    const prevMonth = () => onMonthChange(addDays(monthStart, -1)); // Jump safely to prev month

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            days.push(
                <div
                    key={day.toString()}
                    className={cn(
                        "relative h-14 md:h-20 border border-gray-100 flex flex-col items-start justify-start p-2 cursor-pointer transition-colors hover:bg-gray-50",
                        !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                        isSelected && "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 z-10",
                        // Rounded corners for grid edges could be complex, keeping simple square grid for now
                    )}
                    onClick={() => onDateSelect(cloneDay)}
                >
                    <span className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                        isDayToday && !isSelected && "bg-blue-100 text-blue-700",
                        isSelected && "bg-emerald-600 text-white"
                    )}>
                        {formattedDate}
                    </span>
                    {/* We can add dots/indicators here later */}
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>
            <div>{rows}</div>
        </div>
    );
}
