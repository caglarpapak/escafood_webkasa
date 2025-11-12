import rateLimit from "express-rate-limit";
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;
export const authRateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin." },
});
export const uploadRateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Yükleme limiti aşıldı. Lütfen kısa süre sonra tekrar deneyin." },
});
//# sourceMappingURL=rate-limit.js.map