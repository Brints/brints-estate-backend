/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import twilio from "twilio";

const accountSid = process.env["TWILIO_ACCOUNT_SID"];
const authToken = process.env["TWILIO_AUTH_TOKEN"];

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, body: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const message = await client.messages.create({
      body,
      from: process.env["TWILIO_PHONE_NUMBER"] as string,
      to,
    });

    console.log(`Message sent to ${to} with sid: ${message.sid}`);

    // return message;
  } catch (error) {
    console.log(error);
  }
};

export const verificationMessage = (code: string, duration: string) =>
  `Your Brints Estate verification code is ${code}. This code will expire in ${duration} minutes. Do not share this code with anyone.`;
