import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Modal } from './Modal';
import type { Slot } from '../types';

interface SlotEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    slot?: Slot | null; // If null, we are creating a new one (needs date context though)
    dateContext: Date;
    onSave: (slotData: Slot) => void;
    onDelete?: (slot: Slot) => void;
}

export function SlotEditorModal({ isOpen, onClose, slot, dateContext, onSave, onDelete }: SlotEditorModalProps) {
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [quota, setQuota] = useState(10);
    const [location, setLocation] = useState("Bangkok");

    useEffect(() => {
        if (slot) {
            setStartTime(slot.startTime);
            setEndTime(slot.endTime);
            setQuota(slot.maxQuota);
            setLocation(slot.location || "Bangkok");
        } else {
            // Default values
            setStartTime("09:00");
            setEndTime("10:00");
            setQuota(10);
            setLocation("Bangkok");
        }
    }, [slot, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dateString = slot?.date || format(dateContext, "yyyy-MM-dd"); // Use context if new

        onSave({
            date: dateString,
            startTime,
            endTime,
            maxQuota: Number(quota),
            location,
            bookedCount: slot?.bookedCount || 0
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={slot ? "Edit Slot" : "Add New Slot"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">End Time</label>
                        <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Max Quota (Seats)</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        value={quota}
                        onChange={(e) => setQuota(Number(e.target.value))}
                        min={1}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option value="Bangkok">Bangkok</option>
                        <option value="Rayong">Rayong</option>
                    </select>
                </div>

                <div className="flex gap-2 pt-2">
                    {slot && onDelete && (
                        <button
                            type="button"
                            onClick={() => { onDelete(slot); onClose(); }}
                            className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 transition-all"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-[2] bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-all"
                    >
                        Save Slot
                    </button>
                </div>
            </form>
        </Modal>
    );
}
