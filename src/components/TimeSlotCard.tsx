import type { Slot } from '../types';
import { cn } from '../lib/utils';
import { Clock, Users, Trash2, Edit } from 'lucide-react';

interface TimeSlotCardProps {
    slot: Slot;
    onBook?: (slot: Slot) => void;
    isAdmin?: boolean;
    onEdit?: (slot: Slot) => void;
    onDelete?: (slot: Slot) => void;
}

export function TimeSlotCard({ slot, onBook, isAdmin, onEdit, onDelete }: TimeSlotCardProps) {
    const isFull = (slot.bookedCount || 0) >= slot.maxQuota;
    const availableCount = slot.maxQuota - (slot.bookedCount || 0);

    // Status Logic
    const statusColor = isFull
        ? "bg-rose-50 border-rose-200 text-rose-900"
        : "bg-emerald-50 border-emerald-200 text-emerald-900";

    const buttonColor = isFull
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm";

    return (
        <div className={cn(
            "border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200",
            statusColor
        )}>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock size={20} className={isFull ? "text-rose-500" : "text-emerald-600"} />
                    <span>{slot.startTime} - {slot.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-80">
                    <Users size={16} />
                    <span>
                        {isFull ? "เต็มแล้ว" : `มีที่ว่าง (${availableCount} ที่)`}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 border border-black/5">
                        Total: {slot.maxQuota}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isAdmin ? (
                    <>
                        <button
                            onClick={() => onEdit?.(slot)}
                            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => onDelete?.(slot)}
                            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => !isFull && onBook?.(slot)}
                        disabled={isFull}
                        className={cn(
                            "px-6 py-2 rounded-lg font-medium transition-all transform active:scale-95",
                            buttonColor
                        )}
                    >
                        {isFull ? "Unavailable" : "จองเลย"}
                    </button>
                )}
            </div>
        </div>
    );
}
