import { Schema, model } from "mongoose";
import { userLoginAttempts } from "../@types";

const userLoginAttemptsSchema = new Schema<userLoginAttempts>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockedUntil: {
    type: Date,
    default: new Date(),
  },
});

export const userLoginAttemptsModel = model<userLoginAttempts>(
  "UserLoginAttempts",
  userLoginAttemptsSchema
);
