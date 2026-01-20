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
    user: string;
    email: string;
    location?: string;
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
