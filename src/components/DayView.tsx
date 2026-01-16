import type { Slot } from '../types';
import { TimeSlotCard } from './TimeSlotCard';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

interface DayViewProps {
    date: Date;
    slots: Slot[];
    loading?: boolean;
    isAdmin?: boolean;
    onBookSlot: (slot: Slot) => void;
    onAddSlot?: () => void;
    onEditSlot?: (slot: Slot) => void;
    onDeleteSlot?: (slot: Slot) => void;
}

export function DayView({ date, slots, loading, isAdmin, onBookSlot, onAddSlot, onEditSlot, onDeleteSlot }: DayViewProps) {

    if (loading) {
        return <div className="p-8 text-center text-gray-400 animate-pulse">Loading slots...</div>;
    }

    const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                    Available Slots for {format(date, "d MMM yyyy")}
                </h3>
                {isAdmin && (
                    <button
                        onClick={onAddSlot}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus size={16} /> Add Slot
                    </button>
                )}
            </div>

            {sortedSlots.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <p>No slots available for this date.</p>
                    {isAdmin && <p className="text-sm mt-2">Click "Add Slot" to create one.</p>}
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedSlots.map((slot, idx) => (
                        <TimeSlotCard
                            key={`${slot.startTime}-${idx}`}
                            slot={slot}
                            isAdmin={isAdmin}
                            onBook={onBookSlot}
                            onEdit={onEditSlot}
                            onDelete={onDeleteSlot}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
