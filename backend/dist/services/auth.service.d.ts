export declare class AuthService {
    static login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map