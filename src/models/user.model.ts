import { Schema, model } from "mongoose";
import { IUser } from "../@types";

// User schema
const userSchema: Schema = new Schema(
  {
    image: [{ url: String, filename: String }],
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["female", "male"] },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user", "agent", "landlord"],
      default: "user",
    },
    verified: { type: Boolean, default: false },
    last_login: { type: Date },
    verificationToken: { type: String, trim: true },
    verificationTokenExpire: { type: Date },
    resetPasswordToken: { type: String, trim: true },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// User model
export const User = model<IUser>("User", userSchema);
