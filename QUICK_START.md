# 🚀 Quick Start Guide - Email Confirmation Feature

## ⚡ 5-Minute Deployment

### Step 1: เปิด Google Apps Script (30 วินาที)
1. เปิด Google Sheet ของคุณ
2. คลิก `Extensions` > `Apps Script`

### Step 2: อัพเดทโค้ด (1 นาที)
1. เลือกทั้งหมดใน editor (`Ctrl+A`)
2. ลบโค้ดเดิม
3. เปิดไฟล์ `backend_code.gs` ในโปรเจค
4. คัดลอกโค้ดทั้งหมด
5. วางลงใน Apps Script Editor
6. กด `Ctrl+S` เพื่อบันทึก

### Step 3: Deploy (2 นาที)
1. คลิก `Deploy` > `Manage deployments`
2. คลิกปุ่ม ✏️ (Edit) ที่ deployment ปัจจุบัน
3. ในส่วน "Version" เลือก `New version`
4. Description: `Added email confirmation feature`
5. คลิก `Deploy`
6. คัดลอก Web App URL (ถ้าต้องการอัพเดทใน frontend)

### Step 4: Authorize Permissions (1 นาที)
**หมายเหตุ:** ขั้นตอนนี้จะเกิดขึ้นเฉพาะครั้งแรก หรือเมื่อมีการเพิ่ม permission ใหม่

1. เมื่อ deploy อาจมีหน้าต่างขออนุญาต
2. คลิก `Review Permissions`
3. เลือก Google Account ของคุณ
4. คลิก `Advanced`
5. คลิก `Go to [Your Project Name] (unsafe)`
6. คลิก `Allow`

**Permissions ที่ต้องการ:**
- ✅ Access to Google Sheets
- ✅ Send email as you

### Step 5: ทดสอบ (1 นาที)
1. เปิด frontend application
2. ทำการจอง slot
3. กรอก email ที่ถูกต้อง
4. คลิก Confirm
5. ตรวจสอบ inbox (และ spam folder)

---

## ✅ Verification Checklist

หลังจาก deploy แล้ว ตรวจสอบสิ่งเหล่านี้:

- [ ] Apps Script บันทึกโค้ดใหม่แล้ว
- [ ] Deploy สำเร็จ (เห็น version ใหม่)
- [ ] Permissions ได้รับการ authorize แล้ว
- [ ] ทดสอบการจองแล้ว
- [ ] ได้รับ email confirmation
- [ ] Email มีข้อมูลถูกต้อง (วันที่, เวลา, สถานที่, Booking ID)

---

## 🎯 Expected Results

### ✅ Success Indicators

1. **ใน Frontend:**
   - เห็นข้อความ "Booking confirmed!"
   - ไม่มี error ใน console

2. **ใน Email:**
   - ได้รับ email ภายใน 1-2 นาที
   - Subject: `✅ Booking Confirmation - [Location] on [Date]`
   - Email มี gradient purple header
   - มีข้อมูลการจองครบถ้วน

3. **ใน Apps Script Logs:**
   - ไปที่ `Executions` ใน Apps Script
   - เห็น execution ล่าสุด status: `Completed`
   - ใน Logs เห็น: `Confirmation email sent to [email] for booking [id]`

---

## 🐛 Troubleshooting

### ❌ Email ไม่ถูกส่ง

**Check 1: Apps Script Logs**
```
1. ใน Apps Script Editor
2. คลิก "Executions" (ด้านซ้าย)
3. ดู execution ล่าสุด
4. ตรวจสอบ error messages
```

**Check 2: Permissions**
```
1. ใน Apps Script Editor
2. คลิก "Project Settings" (⚙️)
3. ตรวจสอบว่ามี "Send email" permission
```

**Check 3: Email Address**
```
1. ตรวจสอบว่า email ที่กรอกถูกต้อง
2. ลองใช้ email อื่นทดสอบ
```

### ❌ Email ไปอยู่ใน Spam

**Solution:**
```
1. ตรวจสอบ Spam/Junk folder
2. Mark email as "Not Spam"
3. เพิ่ม sender email เป็น contact
```

### ❌ Deployment Failed

**Solution:**
```
1. ตรวจสอบว่าโค้ดไม่มี syntax error
2. ลอง refresh browser
3. ลอง deploy อีกครั้ง
4. ตรวจสอบว่า Google Sheet ยังเปิดอยู่
```

---

## 📞 Need Help?

### 📚 Documentation
- **Detailed Guide:** อ่าน `EMAIL_FEATURE.md`
- **Deployment Steps:** อ่าน `DEPLOYMENT_GUIDE.md`
- **Full Summary:** อ่าน `IMPLEMENTATION_SUMMARY.md`

### 🔍 Debug Tools
- **Apps Script Logs:** `Executions` tab
- **Browser Console:** F12 > Console tab
- **Network Tab:** F12 > Network tab

### 💡 Quick Tips
- Email อาจใช้เวลา 1-5 นาที
- ตรวจสอบ Spam folder เสมอ
- หาก email ไม่ส่ง การจองยังคงสำเร็จ
- สามารถ customize email template ได้

---

## 🎨 Preview Email Template

เปิดไฟล์นี้ใน browser เพื่อดูตัวอย่าง email:
```
email-template-example.html
```

หรือ double-click ที่ไฟล์ใน File Explorer

---

## 📊 Email Quota

### Free Gmail Account
- **Limit:** 100 emails/day
- **Reset:** ทุกวันเวลา 00:00 PST

### Google Workspace
- **Limit:** 1,500 emails/day
- **Reset:** ทุกวันเวลา 00:00 PST

### Monitor Usage
```
1. Apps Script > Executions
2. นับจำนวน executions ที่ส่ง email
3. หากใกล้ limit พิจารณา upgrade
```

---

## 🎯 Next Steps (Optional)

### Customize Email
1. เปิด `backend_code.gs`
2. หาฟังก์ชัน `sendConfirmationEmail()`
3. แก้ไข `subject`, `htmlBody`, หรือ `plainBody`
4. Deploy version ใหม่

### Change Colors
```javascript
// ใน htmlBody
.header { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
}
// เปลี่ยนเป็นสีที่ต้องการ
```

### Add Logo
```javascript
// ใน htmlBody, ใน .header section
<img src="YOUR_LOGO_URL" alt="Logo" style="max-width: 150px;">
<h1>🎉 Booking Confirmed!</h1>
```

### Translate to Thai
```javascript
const subject = `✅ ยืนยันการจอง - ${location} วันที่ ${date}`;
// แก้ไขข้อความทั้งหมดใน htmlBody และ plainBody
```

---

## ✨ Success!

หากคุณทำตามขั้นตอนทั้งหมดแล้ว:

🎉 **ยินดีด้วย!** ฟีเจอร์การส่ง email ยืนยันการจองทำงานแล้ว!

ผู้ใช้จะได้รับ email ยืนยันอัตโนมัติทุกครั้งที่ทำการจอง พร้อมข้อมูลครบถ้วนและดีไซน์สวยงาม

---

**Quick Start Version:** 1.0  
**Last Updated:** 2026-01-25  
**Estimated Time:** 5 minutes  
**Difficulty:** ⭐⭐☆☆☆ (Easy)
