import { Schema, model } from "mongoose";
import { UserAuth } from "../@types";

// UserAuth schema
const userAuth: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    verificationToken: { type: String, required: true },
    resetPasswordToken: { type: String },
    tokenExpiration: { type: Date },
    emailVerified: { type: Boolean, default: false },
    phoneNumberVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// UserAuth model
export const UserAuthModel = model<UserAuth>("UserAuth", userAuth);
