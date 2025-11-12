import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

const { JWT_SECRET, JWT_EXPIRATION } = env;
const secret: Secret = JWT_SECRET;

export interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  role?: string;
}

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,
    secret,
    {
      expiresIn: JWT_EXPIRATION,
    } as SignOptions,
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
