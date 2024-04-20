import * as crypto from "crypto";

export const generateVerificationToken = () => {
  return crypto.randomBytes(28).toString("hex");
};

// export const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

export const generateOTP = (len: number) => {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, len);
};
