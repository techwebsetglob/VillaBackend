const nodemailer = require("nodemailer");

// Create transporter
// For Gmail, you can use App Password (16 characters)
// For development, you can use Mailtrap or similar
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, type = "verification") => {
  try {
    const transporter = createTransporter();

    const subject =
      type === "verification"
        ? "Your Verification Code - Bright Villas"
        : "Your Password Reset Code - Bright Villas";

    const message =
      type === "verification"
        ? `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
        : `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

    const mailOptions = {
      from: process.env.EMAIL_USER || "brightvillas@gmail.com",
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bright Villas</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">${type === "verification" ? "Email Verification" : "Password Reset"}</h2>
            <p style="color: #666;">Your verification code is:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Send SMS (for phone OTP - requires Twilio or similar service)
// For now, we'll just log the OTP
const sendOTPSMS = async (phone, countryCode, otp) => {
  // In production, integrate with Twilio or other SMS service
  console.log(`SMS OTP for ${countryCode}${phone}: ${otp}`);
  return { success: true };
};

module.exports = {
  sendOTPEmail,
  sendOTPSMS,
};
