import { Schema, model } from "mongoose";
import { IUser } from "../@types";

// User schema
const userSchema: Schema = new Schema(
  {
    avatar: [{ url: String, filename: String }],
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["female", "male"] },
    phone: { type: String, required: true, trim: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user", "realtor", "landlord"],
      default: "user",
    },
    last_login: { type: Date },
    verified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// User model
export const User = model<IUser>("User", userSchema);
