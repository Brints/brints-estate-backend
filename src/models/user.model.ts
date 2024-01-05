import { Schema, model, Document } from "mongoose";

// User interface
export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  role: string;
  verified: boolean;
  verificationToken: string;
  verificationTokenExpire: Date;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  [key: string]: unknown;
}

// User schema
const userSchema: Schema = new Schema(
  {
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
    verificationToken: { type: String, required: true, trim: true },
    verificationTokenExpire: { type: Date, required: true },
    resetPasswordToken: { type: String, trim: true },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// User model
export const User = model<IUser>("User", userSchema);
