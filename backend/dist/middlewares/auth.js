import { verifyAccessToken } from "../utils/token.js";
export const authenticate = (options) => (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        if (options?.optional) {
            return next();
        }
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return res.status(401).json({ message: "Invalid authorization header" });
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (options?.optional) {
            return next();
        }
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
//# sourceMappingURL=auth.js.map