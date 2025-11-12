import jwt, {} from "jsonwebtoken";
import { env } from "../config/env.js";
const { JWT_SECRET, JWT_EXPIRATION } = env;
const secret = JWT_SECRET;
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, secret, {
        expiresIn: JWT_EXPIRATION,
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, secret);
};
//# sourceMappingURL=token.js.map