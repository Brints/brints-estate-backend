import { emailService } from "./email.service";
import { IUser } from "../@types";

// Register user email template
export const registerEmailTemplate = async (user: IUser) => {
  const { email, fullname, verificationToken, verificationTokenExpire } = user;
  const verificationUrl = `${process.env["BASE_URL"]}/user/verify-email/${verificationToken}/${email}`;
  const expiration =
    Math.round(
      ((verificationTokenExpire as Date).getTime() - new Date().getTime()) /
        3600000
    ) + " hours";

  const subject = "Verify your email";
  const html = `<h2>Hello, <span style="color: crimson">${
    fullname.split(" ")[0]
  }</span></h2>
      <p>Thanks for creating an account with us. Please click the link below to verify your email address. Verification link expires in ${expiration}</p>
      <a href="${verificationUrl}" target="_blank" style="background-color: crimson; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a>`;
  await emailService.sendEmail(email, subject, html);
};
