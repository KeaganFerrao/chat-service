import { sendResponse } from "@utility/api";
import { decodeToken } from "@utility/auth";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { MessageService } from "../interfaces/messages";
import { Logger } from "../interfaces/logger";

export class AuthMiddleware {
    private messageService: MessageService;
    private logger: Logger;

    constructor(messageService: MessageService, logger: Logger) {
        this.messageService = messageService;
        this.logger = logger;
    }

    ValidateToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.logger.debug('Validating Admin token');

            const bearerToken = req.headers?.authorization;
            if (!bearerToken) {
                return sendResponse(res, 401, 'Missing Authorization Header');
            }

            const token = bearerToken?.split(' ')?.[1];
            if (!token) {
                this.logger.debug('Missing token in cookie');
                return sendResponse(res, 401, 'Missing Session Token');
            }

            let decodedToken: JwtPayload;
            try {
                decodedToken = await decodeToken(token);
            } catch (error) {
                this.logger.debug('Invalid token');
                return sendResponse(res, 401, 'Invalid token');
            }

            const user = await this.messageService.getBaseUser(decodedToken.id);
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