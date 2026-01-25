# 📧 คู่มือการตั้งค่าระบบส่ง Email Confirmation

## ✅ สถานะการตั้งค่า

- [x] ตั้งค่า Google Cloud Console
- [x] สร้าง OAuth 2.0 Client ID
- [x] ตั้งค่าไฟล์ `.env`
- [x] สร้าง Email Service
- [ ] เพิ่มปุ่ม Authorize Gmail ใน Admin Mode
- [ ] เรียกใช้ Email Service หลัง Booking สำเร็จ
- [ ] ทดสอบการส่ง Email

---

## 📋 ข้อมูลการตั้งค่า

### Email Sender Configuration
- **Sender Email**: `TMMAactivity@gmail.com`
- **Sender Name**: `10% BoostUp Booking`
- **ผู้รับจะเห็น**: "10% BoostUp Booking <TMMAactivity@gmail.com>"

### Gmail API Credentials
- **Client ID**: `1074308044398-d37748cvfs671fpgraurvk5jh6lceshh.apps.googleusercontent.com`
- **Client Secret**: `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` ⚠️ เก็บเป็นความลับ

---

## 🎯 ขั้นตอนถัดไป

### 1. เพิ่มปุ่ม "Authorize Gmail" ใน Admin Mode

ต้องเพิ่มปุ่มให้ Admin สามารถ authorize Gmail account ได้

**ตำแหน่งที่แนะนำ**: ในหน้า Admin Mode ข้างๆ ปุ่ม "Add Slot" หรือ "Settings"

**ฟังก์ชันที่ต้องเรียก**:
```typescript
import { initializeGmailAuth, isGmailAuthenticated } from './services/emailService';

// ตรวจสอบว่า authorize แล้วหรือยัง
const isAuthorized = isGmailAuthenticated();

// เมื่อคลิกปุ่ม Authorize
const handleAuthorizeGmail = () => {
  initializeGmailAuth();
};
```

### 2. Handle OAuth Callback

เพิ่มโค้ดใน `App.tsx` หรือ component หลักเพื่อ handle OAuth callback:

```typescript
import { handleOAuthCallback } from './services/emailService';

useEffect(() => {
  // Check for OAuth callback
  handleOAuthCallback().then((success) => {
    if (success) {
      console.log('Gmail authorized successfully!');
      // อาจจะแสดง notification หรือ refresh UI
    }
  });
}, []);
```

### 3. ส่ง Email หลัง Booking สำเร็จ

เพิ่มการเรียกใช้ `sendBookingConfirmation` หลังจาก booking สำเร็จ:

```typescript
import { sendBookingConfirmation, isGmailAuthenticated } from './services/emailService';

// หลังจาก booking สำเร็จ
const handleBookingSuccess = async (booking: Booking) => {
  // บันทึก booking ลง Google Sheets (existing code)
  await saveBooking(booking);
  
  // ส่ง email confirmation (ถ้า authorize แล้ว)
  if (isGmailAuthenticated()) {
    const emailSent = await sendBookingConfirmation(booking);
    if (emailSent) {
      console.log('Confirmation email sent!');
    } else {
      console.warn('Failed to send confirmation email');
    }
  }
};
```

---

## 🧪 การทดสอบ

### ขั้นตอนการทดสอบ:

1. **รันแอพพลิเคชัน**
   ```bash
   npm run dev
   ```

2. **เข้า Admin Mode** (ใส่รหัส 911)

3. **คลิกปุ่ม "Authorize Gmail"**
   - จะถูก redirect ไปหน้า Google Login
   - Login ด้วย `TMMAactivity@gmail.com`
   - อนุญาตให้แอพส่ง email

4. **ทำการ Booking ทดสอบ**
   - กรอกข้อมูลพร้อม email ที่ถูกต้อง
   - Submit booking

5. **ตรวจสอบ Email**
   - เช็ค inbox ของ email ที่ใช้ booking
   - ควรได้รับ email confirmation
   - ตรวจสอบว่า sender แสดงเป็น "10% BoostUp Booking"

---

## 🔧 Troubleshooting

### ❌ ปัญหา: "Access blocked: This app's request is invalid"
**สาเหตุ**: ยังไม่ได้เพิ่ม Test User ใน OAuth consent screen

**วิธีแก้**:
1. ไปที่ Google Cloud Console > OAuth consent screen
2. เลือก "EDIT APP"
3. ไปที่หน้า "Test users"
4. เพิ่ม `TMMAactivity@gmail.com`
5. SAVE

### ❌ ปัญหา: "redirect_uri_mismatch"
**สาเหตุ**: Redirect URI ไม่ตรงกับที่ตั้งค่าใน Google Cloud Console

**วิธีแก้**:
1. ไปที่ Google Cloud Console > Credentials
2. คลิกที่ OAuth Client ID
3. ตรวจสอบ "Authorized redirect URIs"
4. ต้องมี `http://localhost:5173` (ไม่มี trailing slash)

### ❌ ปัญหา: Email ไม่ถูกส่ง
**วิธีตรวจสอบ**:
1. เปิด Browser Console (F12)
2. ดู error messages
3. ตรวจสอบว่า `isGmailAuthenticated()` return `true` หรือไม่
4. ลอง authorize ใหม่

---

## 📚 เอกสารอ้างอิง

- [Gmail API Setup Guide](./GMAIL_API_SETUP_GUIDE.md) - คู่มือการตั้งค่า Google Cloud Console แบบละเอียด
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

---

## 🔐 ความปลอดภัย

⚠️ **สำคัญมาก**:
- ห้าม commit ไฟล์ `.env` ลง Git
- ห้ามแชร์ Client Secret ให้ใคร
- ตรวจสอบว่า `.env` อยู่ใน `.gitignore` แล้ว

---

**อัพเดทล่าสุด**: 2026-01-26
