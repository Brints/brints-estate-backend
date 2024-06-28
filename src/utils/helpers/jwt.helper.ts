import * as jwt from "jsonwebtoken";
import { Secret } from "jsonwebtoken";

/**
 * @description Generate a JWT token
 * @param {object} payload
 * @param expiresIn - time it will take for the token to expire
 * @returns {string} token
 */

export const generateToken = (
  payload: Record<string, unknown>,
  expiresIn: string | number = process.env["JWT_EXPIRES_IN"] as string
): string => {
  const token = jwt.sign(payload, process.env["JWT_SECRET"] as Secret, {
    expiresIn,
  });
  return token;
};

/**
 * @description Verify a JWT token
 * @param {string} token
 * @returns {object} payload
 */

export const verifyToken = (token: string): Record<string, unknown> | null => {
  try {
    const payload = jwt.verify(token, process.env["JWT_SECRET"] as Secret);
    return payload as Record<string, unknown>;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
