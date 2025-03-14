import { NextFunction, Request, Response } from "express";
import { sendResponse } from '../utility/api';
import logger from "../setup/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    const errStatus = (typeof err?.code === 'number' ? err.code : 500) as number;
    const errMsg = err?.message || 'Something went wrong';

    sendResponse(res, errStatus, errMsg);
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    try {
        sendResponse(res, 404, 'Not found');
    } catch (error) {
        logger.error(error);
        logger.error('Error in notFoundHandler');
        sendResponse(res, 500, 'Something went wrong');
    }
}