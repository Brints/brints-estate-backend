import * as crypto from "crypto";

export const generateVerificationToken = () => {
  return crypto.randomBytes(28).toString("hex");
};
