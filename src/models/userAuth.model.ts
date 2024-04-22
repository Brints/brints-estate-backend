import { Schema, model } from "mongoose";
import { UserAuth } from "../@types";

// UserAuth schema
const userAuth: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String },
    otpExpiration: { type: Date },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    tokenExpiration: { type: Date },
    emailVerified: { type: Boolean, default: false },
    phoneNumberVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "verified", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// UserAuth model
export const UserAuthModel = model<UserAuth>("UserAuth", userAuth);
