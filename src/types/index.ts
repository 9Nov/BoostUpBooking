export interface Slot {
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    maxQuota: number;
    location?: string; // "Bangkok" | "Rayong"
    bookedCount?: number; // Calculated on fetching
}

export interface Booking {
    id: string;
    date: string;
    timeSlot: string; // "HH:mm-HH:mm"
    startTime: string; // HH:mm (parsed from timeSlot)
    endTime: string; // HH:mm (parsed from timeSlot)
    user: string;
    name: string; // Same as user, for email template
    email: string;
    phone?: string;
    location?: string;
    notes?: string;
    timestamp: string;
}

export interface ApiError {
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
