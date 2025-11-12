import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z
        .string()
        .optional()
        .default("postgresql://postgres:postgres@localhost:5432/esca_kasa?schema=public"),
    JWT_SECRET: z
        .string()
        .min(16, "JWT_SECRET must be at least 16 characters")
        .default("change-me-in-production"),
    JWT_EXPIRATION: z.string().default("1d"),
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().int().positive().default(1025),
    SMTP_SECURE: z
        .union([z.boolean(), z.string()])
        .default(false)
        .transform((value) => {
        if (typeof value === "boolean")
            return value;
        return ["true", "1", "yes"].includes(value.toLowerCase());
    }),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z
        .string()
        .email()
        .default("muhasebe@esca-food.com"),
    UPLOAD_DIR: z.string().default("uploads"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment configuration", parsed.error.format());
    throw new Error("Invalid environment configuration");
}
export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
//# sourceMappingURL=env.js.map