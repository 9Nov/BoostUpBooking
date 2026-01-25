import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Layout } from './components/Layout';
import { CalendarGrid } from './components/CalendarGrid';
import { DayView } from './components/DayView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { BookingModal } from './components/BookingModal';
import { SlotEditorModal } from './components/SlotEditorModal';
import { api } from './services/api';
import {
  initializeGmailAuth,
  handleOAuthCallback,
  isGmailAuthenticated,
  sendBookingConfirmation
} from './services/emailService';
import type { Slot } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState("Bangkok");

  // Modes
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGmailAuthorized, setIsGmailAuthorized] = useState(false);

  // Modals
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Handle OAuth callback on mount
  useEffect(() => {
    handleOAuthCallback().then((success) => {
      if (success) {
        setIsGmailAuthorized(true);
        console.log('Gmail authorized successfully!');
      }
    });
    // Check if already authorized
    setIsGmailAuthorized(isGmailAuthenticated());
  }, []);

  // Data Fetching
  const fetchSlots = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");

    try {
      const res = await api.getSlots(start, end);
      if (res.success && res.data) {
        setSlots(res.data);
      } else {
        console.error("API Error or Empty Data", res);
      }
    } catch (error: any) {
      console.error("Failed to fetch slots", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [currentDate]);

  // Derived State
  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return slots.filter(s => {
      const isDateMatch = s.date === dateStr;
      const slotLoc = s.location || "Bangkok";
      return isDateMatch && slotLoc === locationFilter;
    });
  }, [slots, selectedDate, locationFilter]);

  // Actions
  const handleBookingConfirm = async (name: string, email: string) => {
    if (!bookingSlot) return;

    const [startTime, endTime] = bookingSlot.startTime && bookingSlot.endTime
      ? [bookingSlot.startTime, bookingSlot.endTime]
      : ['', ''];

    try {
      const res = await api.createBooking({
        date: bookingSlot.date,
        timeSlot: `${bookingSlot.startTime}-${bookingSlot.endTime}`,
        startTime: startTime,
        endTime: endTime,
        user: name,
        name: name,
        email: email,
        location: bookingSlot.location
      });

      if (res.success) {
        // Send email confirmation if Gmail is authorized
        if (isGmailAuthorized) {
          const bookingData = {
            id: res.data?.id || '',
            date: bookingSlot.date,
            timeSlot: `${bookingSlot.startTime}-${bookingSlot.endTime}`,
            startTime: bookingSlot.startTime,
            endTime: bookingSlot.endTime,
            user: name,
            name: name,
            email: email,
            location: bookingSlot.location,
            timestamp: new Date().toISOString()
          };

          const emailSent = await sendBookingConfirmation(bookingData);
          if (emailSent) {
            console.log('✅ Confirmation email sent successfully!');
          } else {
            console.warn('⚠️ Failed to send confirmation email');
          }
        }

        setBookingSlot(null);
        fetchSlots(); // Refresh
        alert("Booking confirmed!" + (isGmailAuthorized ? " Confirmation email sent." : ""));
      } else {
        alert("Booking failed: " + res.error);
      }
    } catch (e: any) {
      alert("Error booking slot");
    }
  };

  const handleAuthorizeGmail = () => {
    initializeGmailAuth();
  };

  const handleSaveSlot = async (slotData: Slot) => {
    try {
      const res = await api.saveSlot(slotData);
      if (res.success) {
        setEditingSlot(null);
        setIsAddingSlot(false);
        fetchSlots();
      } else {
        alert("Failed to save: " + res.error);
      }
    } catch (e) {
      alert("Error saving slot");
    }
  };

  const handleDeleteSlot = async (slotData: Slot) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      const res = await api.deleteSlot(slotData);

      if (res.success) {
        setEditingSlot(null);
        setIsAddingSlot(false);
        fetchSlots();
      } else {
        alert("Failed to delete: " + res.error);
      }
    } catch (e: any) {
      alert("Error deleting slot");
    }
  };

  return (
    <Layout
      isAdmin={isAdmin}
      onAdminLoginClick={() => setShowAdminLogin(true)}
      onExitAdmin={() => setIsAdmin(false)}
      isGmailAuthorized={isGmailAuthorized}
      onAuthorizeGmail={handleAuthorizeGmail}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onMonthChange={setCurrentDate}
            slots={slots}
          />
        </div>

        <div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
            <span className="font-medium text-gray-700">Location</span>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(["Bangkok", "Rayong"] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${locationFilter === loc ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
          <DayView
            date={selectedDate}
            slots={slotsForSelectedDay}
            loading={loading}
            isAdmin={isAdmin}
            onBookSlot={setBookingSlot}
            onAddSlot={() => setIsAddingSlot(true)}
            onEditSlot={setEditingSlot}
            onDeleteSlot={handleDeleteSlot}
          />
        </div>
      </div>

      {/* Modals */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={() => setIsAdmin(true)}
      />

      <BookingModal
        isOpen={!!bookingSlot}
        onClose={() => setBookingSlot(null)}
        slot={bookingSlot}
        onConfirm={handleBookingConfirm}
      />

      <SlotEditorModal
        isOpen={!!editingSlot || isAddingSlot}
        onClose={() => { setEditingSlot(null); setIsAddingSlot(false); }}
        slot={editingSlot}
        dateContext={selectedDate}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
      />

    </Layout >
  );
}

export default App;
