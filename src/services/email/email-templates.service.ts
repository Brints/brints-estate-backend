import { emailService } from "./email.service";
import { IUser, UserAuth } from "../../@types";

// Register user email template
export const registerEmailTemplate = async (
  user: IUser,
  userAuth: UserAuth
) => {
  const { email, fullname } = user;
  const { verificationToken, tokenExpiration } = userAuth;
  const verificationUrl = `${process.env["FRONTEND_URL"]}/verify-email?token=${verificationToken}&email=${email}`;

  // const expiration =
  //   Math.round((tokenExpiration as Date).getTime() - new Date().getTime()) /
  //     60000 +
  //   " minutes";

  // convert token expiration to hours
  const expiration = Math.round(
    (tokenExpiration as Date).getTime() - new Date().getTime()
  );

  const subject = "Verify your email";
  const html = `<h2>Hello, <span style="color: crimson">${
    fullname.split(" ")[0]
  }</span></h2>
      <p>Thanks for creating an account with us. Please click the link below to verify your email address. Verification link expires in ${expiration}</p>
      <a href="${verificationUrl}" target="_blank" style="background-color: crimson; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a>`;
  await emailService.sendEmail(email, subject, html);
};

// Verify email template
export const successEmailTemplate = async (user: IUser) => {
  const { email, fullname } = user;
  const subject = "Welcome to Brints Estate";
  const html = `<h2>Dear, <span style="color: crimson">${
    fullname.split(" ")[0]
  } 😍</span></h2>
  <p>Welcome aboard! We're thrilled to have you as a part of Brints Estate. Your registration was successful, and you're now officially a member of our community.</p>
  <p>Here are a few things to get you started:</p>
  <ul>
    <li><strong>Explore Your Dashboard:</strong> Log in to your account and take a tour of your dashboard. This is your personalized space where you can manage your profile, settings, and activities.</li>
    <li>Explore our <a href="${
      process.env["BASE_URL"]
    }" target="_blank">website</a> to find your dream home.</li>
    <li>Check out our <a href="${
      process.env["BASE_URL"]
    }/properties" target="_blank">listings</a> to find your dream home.</li>
  </ul>
  <p>If you have any questions or need assistance, our support team is here to help. Just reply to this email, and we'll get back to you promptly.</p>
  <p>Once again, welcome to [Your Platform]! We're excited to have you on board.</p>
  <p>Best regards,</p>
  <p>The Brints Estate Team ❤</p>`;
  await emailService.sendEmail(email, subject, html);
};

// Generate New Verification Token Email Template
export const generateNewVerificationTokenTemplate = async (
  user: IUser,
  userAuth: UserAuth
) => {
  const { email, fullname } = user;
  const { verificationToken, tokenExpiration } = userAuth;

  // set verification url
  const verificationUrl = `${process.env["BASE_URL"]}/user/verify-email/${verificationToken}/${email}`;

  const expiration =
    Math.round((tokenExpiration as Date).getTime() - new Date().getTime()) /
      60000 +
    " minutes";

  // email subject and html
  const subject = "New Verification Token";
  const html = `<h2>Hello, <span style="color: crimson">${
    fullname.split(" ")[0]
  }</span></h2>
    <p>A new verification token has been generated for you. Please find the token in the link below. Verification link expires in ${expiration}</p>
    <a href="${verificationUrl}" target="_blank" style="background-color: crimson; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a>`;

  // send email
  await emailService.sendEmail(email, subject, html);
};

/**
 * @description Send OTP to email to verify phone number
 *
 */

export const sendOTPToEmailTemplate = async (
  user: IUser,
  userAuth: UserAuth
) => {
  const { email, fullname } = user;
  const { otp, otpExpiration } = userAuth;

  const expiration = otpExpiration
    ? Math.round(otpExpiration.getTime() - new Date().getTime()) / 60000 +
      " minutes"
    : "5 minutes";

  // email subject and html
  const subject = "Verify Your Phone Number";
  const html = `<h2>Hello, <span style="color: crimson">${
    fullname.split(" ")[0]
  }</span></h2>
    <p>Here is your OTP code to verify your phone number: <strong>${otp}</strong></p>
    <p>OTP expires in ${expiration} minutes</p>`;

  // send email
  await emailService.sendEmail(email, subject, html);
};
