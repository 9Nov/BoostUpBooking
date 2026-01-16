import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Slot } from '../types';
import { format } from 'date-fns';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    slot: Slot | null;
    onConfirm: (name: string, email: string) => void;
    isSubmitting?: boolean;
}

export function BookingModal({ isOpen, onClose, slot, onConfirm, isSubmitting }: BookingModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim()) {
            onConfirm(name, email);
            setName("");
            setEmail("");
        }
    };

    if (!slot) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Booking">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-1 text-sm border border-gray-100">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium">{format(new Date(slot.date), "d MMMM yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Time</span>
                        <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Availability</span>
                        <span className="font-medium text-emerald-600">Available ({slot.maxQuota - (slot.bookedCount || 0)} left)</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Your Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Your Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                </button>
            </form>
        </Modal>
    );
}
