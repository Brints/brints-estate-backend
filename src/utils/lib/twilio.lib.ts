/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Twilio } from "twilio";

export class TwilioSMS {
  private client: Twilio;
  private fromPhoneNumber: string;

  constructor(accountSid: string, authToken: string, fromPhoneNumber: string) {
    this.client = new Twilio(accountSid, authToken);
    this.fromPhoneNumber = fromPhoneNumber;
  }

  async sendOtp(toPhoneNumber: string, otp: string): Promise<void> {
    const message = `Your OTP is: ${otp}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.client.messages.create({
        body: message,
        from: this.fromPhoneNumber,
        to: toPhoneNumber,
      });
      console.log("OTP sent successfully");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      throw error;
    }
  }
}

export const twilioSMS = new TwilioSMS(
  process.env["TWILIO_ACCOUNT_SID"] as string,
  process.env["TWILIO_AUTH_TOKEN"] as string,
  process.env["TWILIO_PHONE_NUMBER"] as string
);

// const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
// const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
// const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

// const twilioSMS = new TwilioSMS(accountSid, authToken, fromPhoneNumber);

// // Example usage
// const toPhoneNumber = '+1234567890'; // The phone number you are sending to
// const otp = '123456'; // The OTP to send

// twilioSMS.sendOtp(toPhoneNumber, otp)
//   .then(() => console.log('OTP sent'))
//   .catch(error => console.error('Error sending OTP:', error));
