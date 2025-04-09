import { sendResponse } from "@utility/api";
import { NextFunction, Request, Response } from "express";
import { MessageService } from "../interfaces/messages";
import { Logger } from "../interfaces/logger";
import { AuthService } from "../interfaces/auth";

export class AuthMiddleware {
    private messageService: MessageService;
    private logger: Logger;
    private authService: AuthService;

    constructor(messageService: MessageService, authService: AuthService ,logger: Logger) {
        this.messageService = messageService;
        this.authService = authService;
        this.logger = logger;
    }

    ValidateToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.logger.debug('Validating Admin token');

            const token = this.authService.extractToken(req.headers);
            if (!token) {
                return sendResponse(res, 401, 'Missing token');
            }

            let decodedToken: Record<string, any>;
            try {
                decodedToken = await this.authService.verifyToken(token);
            } catch (error) {
                this.logger.debug('Invalid token');
                return sendResponse(res, 401, 'Invalid token');
            }

            const user = await this.messageService.getBaseUser(decodedToken.payload.id);
            if (!user) {
                this.logger.debug('Invalid user');
                return sendResponse(res, 403, 'Invalid user');
            }

            this.logger.debug('Token validated successfully');
            next();
        } catch (error: any) {
            this.logger.error('Error while validating token');
            this.logger.error(error);
            return sendResponse(res, 500, error?.message?.toString() || 'Internal server error');

        }
    }
}