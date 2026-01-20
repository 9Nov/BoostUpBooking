/**
 * Google Apps Script Code
 * Copy and paste this into extensions > Apps Script in your Google Sheet.
 * Then Deploy as Web App -> Execute as: Me -> Who has access: Anyone.
 */

const SHEET_SLOTS = "Slots";
const SHEET_BOOKINGS = "Bookings";

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getSlots") {
    return getSlots(e.parameter.startDate, e.parameter.endDate);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid action" })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === "createBooking") {
    return createBooking(data.payload);
  } else if (action === "saveSlot") {
    // Admin only
    return saveSlot(data.payload);
  } else if (action === "deleteSlot") {
    // Admin only
    return deleteSlot(data.payload);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid action" })).setMimeType(ContentService.MimeType.JSON);
}

// --- Helpers ---

function getSlots(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone(); // Use Spreadsheet TimeZone
  const slotSheet = ss.getSheetByName(SHEET_SLOTS);
  const bookingSheet = ss.getSheetByName(SHEET_BOOKINGS);
  
  if (!slotSheet || !bookingSheet) {
     return response({ success: false, error: "Sheets not found. Please create 'Slots' and 'Bookings' sheets." });
  }

  const slots = getData(slotSheet, tz);
  const bookings = getData(bookingSheet, tz);

  // Calculate booked count with robust comparison
  const result = slots.map(slot => {
     const slotDateNorm = slot.date; // already normalized by getData
     const slotString = `${slot.startTime}-${slot.endTime}`;
     
     const count = bookings.filter(b => {
        // Normalize booking data just in case
        const bDate = b.date instanceof Date ? Utilities.formatDate(b.date, tz, "yyyy-MM-dd") : String(b.date).trim();
        const bTimeSlot = String(b.timeSlot || b.time || "").trim();
        const matches = bDate === slotDateNorm && bTimeSlot === slotString;
        return matches;
     }).length;
     
     return { ...slot, bookedCount: count };
  });

  // Filter by date range if provided (simple string comparison for YYYY-MM-DD works)
  const filtered = result.filter(s => {
    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;
    return true;
  });

  
  const foundHeaders = slots.length > 0 ? Object.keys(slots[0]) : "No data";
  const bookingSample = bookings.length > 0 ? bookings.slice(0, 3) : "No booking data";
  const bookingHeaders = bookings.length > 0 ? Object.keys(bookings[0]) : "No booking headers";
  
  return response({ 
      success: true, 
      data: filtered, 
      backendVersion: "v4.8.0", 
      debugHeaders: foundHeaders,
      debugBookings: bookingSample,
      debugBookingHeaders: bookingHeaders
  });
}

function createBooking(payload) {
  const { date, timeSlot, user, email, location } = payload;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const bookingSheet = ss.getSheetByName(SHEET_BOOKINGS);
  const slotSheet = ss.getSheetByName(SHEET_SLOTS);

  // Check quota
  const slots = getData(slotSheet, tz);
  
  // Robust search: Normalize everything to strings to allow matching even if getData failed to normalize
  const targetSlot = slots.find(s => {
      const sDate = s.date instanceof Date ? Utilities.formatDate(s.date, tz, "yyyy-MM-dd") : String(s.date).trim();
      const sStart = s.startTime instanceof Date ? Utilities.formatDate(s.startTime, tz, "HH:mm") : String(s.startTime).trim().substring(0, 5);
      const sEnd = s.endTime instanceof Date ? Utilities.formatDate(s.endTime, tz, "HH:mm") : String(s.endTime).trim().substring(0, 5);
      const sLocation = s.location ? String(s.location).trim() : "";
      
      const timeMatch = `${sStart}-${sEnd}` === timeSlot;
      // If location is provided, it MUST match. If not provided (legacy), lenient? No, force match if column exists.
      // Assuming new system always sends location for slots that have it. 
      // Or simplify: match if location strings match (empty matches empty)
      const locationMatch = location ? sLocation === location : true;

      return sDate === date && timeMatch && locationMatch;
  });
  
  if (!targetSlot) {
    // Debug info for "Slot not found"
    const firstSlot = slots.length > 0 ? JSON.stringify(slots[0]) : "No slots found";
    return response({ 
        success: false, 
        error: "Slot not found. Searched for: " + date + " " + timeSlot + " " + (location||"") + ". First slot data: " + firstSlot,
        backendVersion: "v4.9.0"
    });
  }

  const bookings = getData(bookingSheet, tz);
  const currentBookings = bookings.filter(b => {
      const bLocation = b.location ? String(b.location).trim() : "";
      const locMatch = location ? bLocation === location : true;
      return b.date === date && b.timeSlot === timeSlot && locMatch;
  }).length;

  if (currentBookings >= targetSlot.maxQuota) {
    return response({ success: false, error: "Slot is full" });
  }

  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  
  // Append with Location in Column G (index 6, 7th column) if standard, but we just append using appendRow
  // [ID, Date, TimeSlot, User, Email, Timestamp, Location]
  bookingSheet.appendRow([id, date, timeSlot, user, email || "", timestamp, location || ""]);
  
  return response({ success: true, data: { id, date, timeSlot, user, email, timestamp, location } });
}

function saveSlot(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const sheet = ss.getSheetByName(SHEET_SLOTS);
  const data = getData(sheet, tz);
  
  // DEBUG: Log the incoming payload
  Logger.log("saveSlot payload: " + JSON.stringify(payload));
  
  // payload: { date, startTime, endTime, maxQuota, location }
  // Check if exists
  const rowIndex = data.findIndex(row => {
      const rLocation = row.location ? String(row.location).trim() : "";
      const pLocation = payload.location ? String(payload.location).trim() : "";
      
      return row.date === payload.date && 
             row.startTime === payload.startTime && 
             row.endTime === payload.endTime &&
             rLocation === pLocation;
  });
  
  if (rowIndex >= 0) {
    // Update (row index + 2 because header is 1 and data index is 0-based)
    // Update Quota (Column 4) and Location (Column 5)
    sheet.getRange(rowIndex + 2, 4).setValue(payload.maxQuota);
    sheet.getRange(rowIndex + 2, 5).setValue(payload.location || "");
    Logger.log("Updated existing slot at row " + (rowIndex + 2) + " with location: " + payload.location);
  } else {
    // Create
    // [Date, Start, End, Quota, Location]
    const rowData = [payload.date, payload.startTime, payload.endTime, payload.maxQuota, payload.location || ""];
    Logger.log("Creating new slot with data: " + JSON.stringify(rowData));
    sheet.appendRow(rowData);
  }
  
  return response({ success: true, debug: { location: payload.location, rowIndex: rowIndex } });
}

function deleteSlot(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const sheet = ss.getSheetByName(SHEET_SLOTS);
  const data = getData(sheet, tz);
  
  // Delete ALL matches (handle duplicates)
  let deletedCount = 0;
  // Loop backwards to safely delete multiple rows
  for (let i = data.length - 1; i >= 0; i--) {
     const row = data[i];
     const rDate = row.date instanceof Date ? Utilities.formatDate(row.date, tz, "yyyy-MM-dd") : String(row.date).trim();
     const rStart = row.startTime instanceof Date ? Utilities.formatDate(row.startTime, tz, "HH:mm") : String(row.startTime).trim().substring(0, 5);
     const rEnd = row.endTime instanceof Date ? Utilities.formatDate(row.endTime, tz, "HH:mm") : String(row.endTime).trim().substring(0, 5);
     const rLocation = row.location ? String(row.location).trim() : "";
     
     const pLocation = payload.location ? String(payload.location).trim() : "";

     if (rDate === payload.date && rStart === payload.startTime && rEnd === payload.endTime && rLocation === pLocation) {
         sheet.deleteRow(i + 2); // +2 for header and 0-index
         deletedCount++;
     }
  }
   
  if (deletedCount > 0) {
      return response({ success: true, backendVersion: "v4.9.0", message: `Deleted ${deletedCount} slot(s)` });
  } else {
      // Debug info in error
      const firstRow = data.length > 0 ? JSON.stringify(data[0]) : "No data";
      return response({ success: false, error: "Delete failed. Backend v4.9.0. searched for: " + JSON.stringify(payload) + ". First row: " + firstRow, backendVersion: "v4.9.0" });
  }
}

function getData(sheet, tz) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];
  const data = [];
  
  if (!tz) tz = Session.getScriptTimeZone(); // Fallback
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      // Normalize header to camelCase: "Start Time" -> "startTime", "date" -> "date"
      let key = headers[j].toString().trim();
      // Simple camelCase conversion: remove spaces, lowercase first letter
      key = key.replace(/\s+/g, '');
      key = key.charAt(0).toLowerCase() + key.slice(1);
      
      // Alias 'time' -> 'timeSlot' for robustness
      if (key === 'time') key = 'timeSlot';
      
      let val = row[j];
      
      // Normalize Date objects to strings
      if (val instanceof Date) {
        if (key.toLowerCase().includes('date')) {
           val = Utilities.formatDate(val, tz, "yyyy-MM-dd");
        } else if (key === 'startTime' || key === 'endTime') {
           // Only format actual time columns (startTime, endTime), NOT timeSlot
           val = Utilities.formatDate(val, tz, "HH:mm");
        }
      } else if (typeof val === 'string') {
        val = val.trim();
        // Only trim time format for actual time columns, NOT timeSlot which is a range
        if ((key === 'startTime' || key === 'endTime') && val.length > 5) {
           val = val.substring(0, 5);
        }
      }
      
      obj[key] = val;
    }
    data.push(obj);
  }
  return data;
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
