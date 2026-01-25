/**
 * Gmail API Service for sending booking confirmation emails
 * Uses OAuth 2.0 for authentication
 */

import type { Booking } from '../types';

// Gmail API Configuration from environment variables
const CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
const SENDER_EMAIL = import.meta.env.VITE_SENDER_EMAIL;
const SENDER_NAME = import.meta.env.VITE_SENDER_NAME;

const SCOPES = 'https://www.googleapis.com/auth/gmail.send';
const REDIRECT_URI = window.location.origin;

// Token storage key
const TOKEN_KEY = 'gmail_access_token';
const REFRESH_TOKEN_KEY = 'gmail_refresh_token';

/**
 * Initialize Google OAuth 2.0 flow
 */
export const initializeGmailAuth = (): void => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  window.location.href = authUrl;
};

/**
 * Handle OAuth callback and exchange code for tokens
 */
export const handleOAuthCallback = async (): Promise<boolean> => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) return false;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
  }

  return false;
};

/**
 * Check if user is authenticated
 */
export const isGmailAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      return data.access_token;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }

  return null;
};

/**
 * Encode string to RFC 2047 MIME encoded-word format for email headers
 * This is required for non-ASCII characters (like Thai) in email subjects
 */
const encodeRFC2047 = (str: string): string => {
  // Check if string contains non-ASCII characters
  if (!/[^\x00-\x7F]/.test(str)) {
    return str; // No encoding needed for ASCII-only strings
  }

  // Encode to UTF-8 base64 and format as RFC 2047 encoded-word
  const encoded = btoa(unescape(encodeURIComponent(str)));
  return `=?UTF-8?B?${encoded}?=`;
};

/**
 * Create email message in RFC 2822 format
 */
const createEmailMessage = (
  to: string,
  subject: string,
  htmlBody: string
): string => {
  const from = `${SENDER_NAME} <${SENDER_EMAIL}>`;
  const encodedSubject = encodeRFC2047(subject);

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ].join('\r\n');

  // Encode to base64url
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Generate HTML email template for booking confirmation
 * Uses table-based layout and inline styles for maximum email client compatibility
 */
const generateBookingEmailHTML = (booking: Booking): string => {
  const date = new Date(booking.date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const time = `${booking.startTime} - ${booking.endTime}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header with Purple Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 ยืนยันการจอง</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Booking Confirmation</p>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 40px 30px;">
              
              <!-- Success Icon -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <div style="display: inline-block; background-color: #10b981; width: 80px; height: 80px; border-radius: 50%; line-height: 80px; font-size: 48px;">✅</div>
                  </td>
                </tr>
              </table>
              
              <!-- Greeting -->
              <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                สวัสดีคุณ <strong style="color: #667eea;">${booking.name}</strong>,
              </p>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                ขอบคุณที่ทำการจองกับเรา การจองของคุณได้รับการยืนยันแล้ว
              </p>
              
              <!-- Booking Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 20px 0; color: #667eea; font-size: 18px; font-weight: bold;">รายละเอียดการจอง</h3>
                    
                    <!-- Detail Row: Name -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px;">ชื่อ:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px;">${booking.name}</td>
                      </tr>
                    </table>
                    
                    <!-- Detail Row: Email -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px;">อีเมล:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px;">${booking.email}</td>
                      </tr>
                    </table>
                    
                    ${booking.phone ? `
                    <!-- Detail Row: Phone -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px;">เบอร์โทร:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px;">${booking.phone}</td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Detail Row: Date -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px;">วันที่:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px;">${date}</td>
                      </tr>
                    </table>
                    
                    <!-- Detail Row: Time -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px;">เวลา:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px; font-weight: bold;">${time}</td>
                      </tr>
                    </table>
                    
                    ${booking.location ? `
                    <!-- Detail Row: Location -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid #eeeeee;">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px;">สถานที่:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px;">${booking.location}</td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    ${booking.notes ? `
                    <!-- Detail Row: Notes -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; width: 120px; color: #667eea; font-weight: bold; font-size: 14px; vertical-align: top;">หมายเหตุ:</td>
                        <td style="padding: 12px 0; color: #333333; font-size: 14px;">${booking.notes}</td>
                      </tr>
                    </table>
                    ` : ''}
                    
                  </td>
                </tr>
              </table>
              
              <!-- Additional Info -->
              <p style="margin: 30px 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                หากคุณมีคำถามหรือต้องการเปลี่ยนแปลงการจอง กรุณาติดต่อที่ 
                <a href="mailto:SIRIWADA@SCG.COM" style="color: #667eea; text-decoration: none;">SIRIWADA@SCG.COM</a>
              </p>
              
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                อย่าลืมเตรียม 10% BoostUp Project มา Present กันนะครับ! 🙏
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 5px 0; color: #999999; font-size: 13px;">
                อีเมลนี้ส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
              </p>
              <p style="margin: 0; color: #999999; font-size: 13px;">
                &copy; 2026 10% BoostUp Booking. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (booking: Booking): Promise<boolean> => {
  let accessToken = localStorage.getItem(TOKEN_KEY);

  // Check if we have a token
  if (!accessToken) {
    console.error('No access token available. Please authenticate first.');
    return false;
  }

  const subject = `ยืนยันการจอง - ${new Date(booking.date).toLocaleDateString('th-TH')} ${booking.startTime}`;
  const htmlBody = generateBookingEmailHTML(booking);
  const encodedMessage = createEmailMessage(booking.email, subject, htmlBody);

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        return sendBookingConfirmation(booking);
      } else {
        console.error('Failed to refresh token. Please re-authenticate.');
        return false;
      }
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Booking confirmation email sent successfully!');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Logout and clear tokens
 */
export const logoutGmail = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
