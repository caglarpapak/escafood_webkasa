import "dotenv/config";
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_SECURE: boolean;
    EMAIL_FROM: string;
    UPLOAD_DIR: string;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
};
export declare const isProduction: boolean;
export declare const isDevelopment: boolean;
//# sourceMappingURL=env.d.ts.map