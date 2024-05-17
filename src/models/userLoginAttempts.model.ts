import { Schema, model } from "mongoose";
import { userLoginAttempts } from "../@types";

const userLoginAttemptsSchema = new Schema<userLoginAttempts>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  blockedUntil: {
    type: Date,
    default: new Date(),
  },
});

export default model<userLoginAttempts>(
  "UserLoginAttempts",
  userLoginAttemptsSchema
);
