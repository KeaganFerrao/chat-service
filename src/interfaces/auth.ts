import { Request } from "express";
import { IncomingHttpHeaders } from "http";

export interface AuthService {
    extractToken(request: IncomingHttpHeaders): string | undefined;
    verifyToken(token: string): Promise<{
        valid: boolean,
        payload?: Record<string, any>
    }>;
    generateToken(payload: Record<string, any>): Promise<string>;
}