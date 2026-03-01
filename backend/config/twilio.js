const twilio = require("twilio");

// Create Twilio client
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

// Send SMS via Twilio
const sendSMS = async (phone, message) => {
  try {
    const client = createTwilioClient();
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!client || !twilioPhoneNumber) {
      console.log("Twilio not configured. SMS would be sent:");
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}`);
      return { success: true, dev: true };
    }

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone,
    });

    console.log(`SMS sent successfully: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
};
