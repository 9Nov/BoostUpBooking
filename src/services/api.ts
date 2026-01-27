import type { Slot, Booking, ApiResponse } from "../types";
import { format } from "date-fns";

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_SLOTS: Slot[] = [
    { date: "2026-01-15", startTime: "10:00", endTime: "11:00", maxQuota: 10, bookedCount: 5 },
    { date: "2026-01-15", startTime: "13:00", endTime: "14:00", maxQuota: 5, bookedCount: 5 }, // Full
    { date: "2026-01-16", startTime: "09:00", endTime: "10:00", maxQuota: 3, bookedCount: 0 },
];

// API URL - Falls back to production URL if env var not set
const API_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbw0Of9V7nqGtWw_dw2qL2fVC39YADa2QMxGko14yRNOkfxvXvj8ihKZKge7weaK1K2W/exec";

export const api = {
    async getSlots(startDate?: string, endDate?: string): Promise<ApiResponse<Slot[]>> {
        if (!API_URL) {
            await delay(500);
            // In a real mock, we would filter MOCK_SLOTS by date
            let slots = [...MOCK_SLOTS];
            if (startDate) {
                slots = slots.filter(s => s.date >= startDate);
            }
            return { success: true, data: slots };
        }

        // Real Fetch Implementation
        try {
            const params = new URLSearchParams({ action: "getSlots" });
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            const res = await fetch(`${API_URL}?${params}`);
            const data = await res.json();
            console.log("API Response:", data); // Debug log

            // Normalize data if backend sends raw ISO strings (UTC)
            if (data.success && Array.isArray(data.data)) {
                data.data = data.data.map((slot: any) => {
                    // Check if likely an ISO string (contains 'T' and 'Z')
                    const isIsoDate = typeof slot.date === 'string' && slot.date.includes('T');

                    if (isIsoDate) {
                        try {
                            return {
                                ...slot,
                                date: format(new Date(slot.date), "yyyy-MM-dd"),
                                startTime: format(new Date(slot.startTime), "HH:mm"),
                                endTime: format(new Date(slot.endTime), "HH:mm")
                            };
                        } catch (e) {
                            console.warn("Failed to parse slot date", slot);
                            return slot;
                        }
                    }
                    return slot;
                });
            }

            return data;
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    async createBooking(booking: Omit<Booking, "id" | "timestamp">): Promise<ApiResponse<Booking>> {
        if (!API_URL) {
            await delay(800);
            const newBooking: Booking = {
                ...booking,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
            };

            // Update local mock state (in a real app we'd need better state management)
            // Update local mock state (in a real app we'd need better state management)
            const slotIndex = MOCK_SLOTS.findIndex(s => s.date === booking.date && `${s.startTime}-${s.endTime}` === booking.timeSlot && (s.location || "Bangkok") === (booking.location || "Bangkok"));
            if (slotIndex >= 0) {
                if ((MOCK_SLOTS[slotIndex].bookedCount || 0) >= MOCK_SLOTS[slotIndex].maxQuota) {
                    return { success: false, error: "Slot is full (mock check)" };
                }
                MOCK_SLOTS[slotIndex].bookedCount = (MOCK_SLOTS[slotIndex].bookedCount || 0) + 1;
            }

            return { success: true, data: newBooking };
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "createBooking", payload: booking })
            });
            return await res.json();
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    async saveSlot(slot: Slot): Promise<ApiResponse<void>> {
        if (!API_URL) {
            await delay(500);
            const existing = MOCK_SLOTS.find(s => s.date === slot.date && s.startTime === slot.startTime && s.endTime === slot.endTime && (s.location || "Bangkok") === (slot.location || "Bangkok"));
            if (existing) {
                existing.maxQuota = slot.maxQuota;
            } else {
                MOCK_SLOTS.push({ ...slot, bookedCount: 0 });
            }
            return { success: true };
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "saveSlot", payload: slot })
            });
            return await res.json();
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    async deleteSlot(slot: Slot): Promise<ApiResponse<void>> {
        if (!API_URL) {
            await delay(500);
            const index = MOCK_SLOTS.findIndex(s => s.date === slot.date && s.startTime === slot.startTime && s.endTime === slot.endTime && (s.location || "Bangkok") === (slot.location || "Bangkok"));
            if (index >= 0) {
                MOCK_SLOTS.splice(index, 1);
            }
            return { success: true };
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "deleteSlot", payload: slot })
            });
            return await res.json();
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};
