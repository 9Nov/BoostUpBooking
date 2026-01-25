# 📅 Calendar Booking Application

A modern, responsive calendar booking system with admin and user modes, location filtering, and automated email confirmations.

## ✨ Features

### User Mode
- 📆 **Calendar View**: Interactive calendar with visual indicators for available slots
- 📍 **Location Filter**: Switch between Bangkok and Rayong locations
- 🎯 **Easy Booking**: Simple booking process with name and email
- 📧 **Email Confirmation**: Automatic confirmation emails with booking details
- 🔴🟢 **Visual Indicators**: 
  - Green dots for Bangkok available slots
  - Blue dots for Rayong available slots
  - Clear availability status

### Admin Mode
- 🔐 **Secure Access**: Password-protected admin mode (passcode: 911)
- ➕ **Slot Management**: Create, edit, and delete booking slots
- 📊 **Quota Control**: Set maximum capacity for each slot
- 📍 **Location Assignment**: Assign slots to Bangkok or Rayong
- 🗑️ **Bulk Operations**: Delete slots with confirmation

### Email Notifications
- ✅ **Instant Confirmation**: Automated emails sent immediately after booking
- 🎨 **Beautiful Design**: Professional HTML email template with gradient header
- 📋 **Complete Details**: Includes date, time, location, and booking ID
- 📱 **Responsive**: Works on all email clients (HTML + Plain Text versions)

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **date-fns** for date manipulation

### Backend
- **Google Apps Script** (deployed as Web App)
- **Google Sheets** as database
- **MailApp** for email notifications

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CalendarBooking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file:
   ```env
   VITE_API_URL=your_google_apps_script_web_app_url
   ```

4. **Setup Google Sheets Backend**
   - Create a new Google Sheet
   - Create two sheets: `Slots` and `Bookings`
   - Set up headers:
     - **Slots**: Date, Start Time, End Time, Max Quota, Location
     - **Bookings**: ID, Date, Time Slot, User, Email, Timestamp, Location
   - Go to Extensions > Apps Script
   - Copy content from `backend_code.gs`
   - Deploy as Web App (Execute as: Me, Access: Anyone)
   - Copy the Web App URL to `.env`

5. **Run development server**
   ```bash
   npm run dev
   ```

## 📧 Email Feature Setup

The email confirmation feature is built into the backend. See [EMAIL_FEATURE.md](./EMAIL_FEATURE.md) for detailed documentation.

### Quick Setup
1. Update `backend_code.gs` in Google Apps Script
2. Deploy new version
3. Authorize email permissions when prompted
4. Test by making a booking

### Email Preview
Confirmation emails include:
- 🎉 Celebratory header
- 📅 Booking date and time
- 📍 Location (Bangkok/Rayong)
- 🔖 Unique booking ID
- 📝 Important notes and instructions

## 🚀 Deployment

### Frontend
```bash
npm run build
```
Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend
1. Open Google Apps Script
2. Click Deploy > Manage deployments
3. Create new deployment or update existing
4. Copy Web App URL
5. Update frontend `.env` with new URL

## 📱 Usage

### For Users
1. Select a date on the calendar
2. Choose your preferred location (Bangkok/Rayong)
3. Click on an available time slot
4. Enter your name and email
5. Confirm booking
6. Check your email for confirmation

### For Admins
1. Click "Admin Login" button
2. Enter passcode: `911`
3. Select a date
4. Click "Add Slot" to create new slots
5. Click on existing slots to edit or delete
6. Exit admin mode when done

## 🔧 Configuration

### Admin Passcode
Change in `src/components/AdminLoginModal.tsx`:
```typescript
const ADMIN_PASSCODE = "911"; // Change this
```

### Email Template
Customize in `backend_code.gs` function `sendConfirmationEmail()`:
- Modify `subject` for email subject line
- Edit `htmlBody` for HTML email design
- Update `plainBody` for plain text version

### Locations
Add/remove locations in `src/App.tsx`:
```typescript
{(["Bangkok", "Rayong", "YourCity"] as const).map((loc) => (
  // ...
))}
```

## 📊 Google Sheets Structure

### Slots Sheet
| Date | Start Time | End Time | Max Quota | Location |
|------|------------|----------|-----------|----------|
| 2026-01-26 | 09:00 | 10:00 | 5 | Bangkok |

### Bookings Sheet
| ID | Date | Time Slot | User | Email | Timestamp | Location |
|----|------|-----------|------|-------|-----------|----------|
| abc-123 | 2026-01-26 | 09:00-10:00 | John | john@example.com | 2026-01-25T... | Bangkok |

## 🐛 Troubleshooting

### Email not received
- Check spam folder
- Verify email address is correct
- Check Google Apps Script execution logs
- Ensure MailApp permissions are granted

### Booking fails
- Check browser console for errors
- Verify Google Apps Script Web App URL
- Check if slot quota is full
- Review Apps Script logs

### Slots not showing
- Verify date range
- Check location filter
- Ensure Slots sheet has correct format
- Check API response in Network tab

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Check [EMAIL_FEATURE.md](./EMAIL_FEATURE.md) for email-specific help
- Review Google Apps Script logs
- Check browser console for frontend errors
