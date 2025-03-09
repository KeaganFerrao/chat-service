import { getBaseUser } from "@models/postgres/helpers/messages";
import logger from "@setup/logger";
import { sendResponse } from "@utility/api";
import { decodeToken } from "@utility/auth";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "sequelize";

const ValidateToken = async (req: Request, res: Response, next: NextFunction) => {
    let transaction: Transaction | null = null;
    try {
        logger.debug('Validating Admin token');

        const bearerToken = req.headers?.authorization;
        if (!bearerToken) {
            return sendResponse(res, 401, 'Missing Authorization Header');
        }

        const token = bearerToken?.split(' ')?.[1];
        if (!token) {
            logger.debug('Missing token in cookie');
            return sendResponse(res, 401, 'Missing Session Token');
        }

        let decodedToken: JwtPayload;
        try {
            decodedToken = await decodeToken(token);
        } catch (error) {
            logger.debug('Invalid token');
            return sendResponse(res, 401, 'Invalid token');
        }

        const user = await getBaseUser(decodedToken.id);
        if (!user) {
            logger.debug('Invalid user');
            return sendResponse(res, 403, 'Invalid user');
        }

        logger.debug('Token validated successfully');
        next();
    } catch (error: any) {
        logger.error('Error while validating token');
        logger.error(error);
        return sendResponse(res, 500, error?.message?.toString() || 'Internal server error');

    }
}

export {
    ValidateToken
}