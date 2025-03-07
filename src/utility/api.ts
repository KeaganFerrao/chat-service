import { NextFunction, Request, Response } from "express";
import logger from "../setup/logger";
import { ServerResponse } from "../types/utility";
import { randomInt } from "crypto";

export const sendResponse = (res: Response, statusCode: number, message: string, data: any = [], errors: Record<string, any>[] = []): void => {
    const response: ServerResponse = {
        success: true,
        data: [],
        message: '',
        errors: []
    }

    if ([200, 201, 202, 203, 204].includes(statusCode)) {
        response.success = true;
    } else {
        response.success = false;
    }

    response.data = data;
    response.message = message ?? '';
    response.errors = errors;

    res.status(statusCode).json(response);
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    logger.debug(`Request: ${req.method} ${req.originalUrl}`);
    next();
}

export const ucFirstChar = (str: string) => {
    return (str && typeof str === 'string') ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export const generateOtp = () => {
    return new Promise<string>((resolve, reject) => {
        randomInt(100000, 999999, (err, num) => {
            if (err) {
                reject(err);
            } else {
                resolve(num.toString());
            }
        });
    });
}

