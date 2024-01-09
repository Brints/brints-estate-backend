import { Document } from "mongoose";
// import { Request } from "express";
declare interface IUser extends Document {
  image?: { url: string; filename: string }[];
  fullname: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  role: string;
  verified: boolean;
  verificationToken: string;
  verificationTokenExpire: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date | null;
  [key: string]: unknown;
}

declare interface RegisterUserRequestBody {
  image?: { url: string; filename: string }[];
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  phone: string;
  role: string;
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpire?: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date | null;
}

declare interface UserError {
  message: string;
  statusCode: number;
}

declare interface GetUserProfileRequest extends Request {
  user: IUser;
}

declare interface SuccessResponseData<T> {
  message: string;
  data: T;
  statusCode: number;
}

declare interface SuccessResponseDataWithToken<T> {
  message: string;
  data: T;
  token: string;
  statusCode: number;
}

declare interface verifyEmailParams {
  token: string;
  email: string;
}

declare interface ErrorResponseData {
  success: boolean;
  error: {
    type: string;
    statusCode: number;
    message: string;
  };
}

declare interface MailgunConfig {
  apiKey: string;
  domain: string;
}

declare interface CustomParams {
  folder: string;
  allowedFormats: string[];
}

declare interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

declare interface MailgunResponse {
  id: string;
  message: string;
}

declare interface MailgunData {
  from: string;
  to: string;
  subject: string;
  html: string;
}
