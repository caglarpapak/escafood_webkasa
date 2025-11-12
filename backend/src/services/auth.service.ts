import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middlewares/error-handler.js";
import { generateAccessToken } from "../utils/token.js";

export class AuthService {
  static async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      throw new HttpError(401, "Geçersiz e-posta veya şifre");
    }

    const passwordMatch = await argon2.verify(user.passwordHash, password);
    if (!passwordMatch) {
      throw new HttpError(401, "Geçersiz e-posta veya şifre");
    }

    const token = generateAccessToken({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: "admin",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
