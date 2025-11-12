export interface JwtPayload {
    sub: string;
    email: string;
    fullName: string;
    role?: string;
}
export declare const generateAccessToken: (payload: JwtPayload) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
//# sourceMappingURL=token.d.ts.map