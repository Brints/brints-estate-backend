import { Schema, model } from "mongoose";

// User interface
export interface IUser {
  fullname: string;
  email: string;
  password: string;
  gender?: string;
  phone?: string;
  usertype: string;
}

// User schema
const userSchema: Schema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["female", "male"],
    },
    phone: {
      type: String,
      trim: true,
    },
    usertype: {
      type: String,
      enum: ["admin", "user", "agent", "landlord"],
    },
  },
  {
    timestamps: true,
  }
);

// User model
export default model<IUser>("User", userSchema);
