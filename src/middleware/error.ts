import { NextFunction, Request, Response } from "express";
import { sendResponse } from '../utility/api';
import logger from "../setup/logger";
import { WithTransaction } from "@type/utility";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    const errStatus = (typeof err?.code === 'number' ? err.code : 500) as number;
    const errMsg = err?.message || 'Something went wrong';

    sendResponse(res, errStatus, errMsg);
}

export const notFoundHandler = (req: WithTransaction, res: Response, next: NextFunction) => {
    try {
        const transaction = req.transaction;
        if (transaction) {
            logger.debug('Rolling back transaction');
            transaction.rollback();
        }

        sendResponse(res, 404, 'Not found');
    } catch (error) {
        logger.error(error);
        logger.error('Error in notFoundHandler');
        sendResponse(res, 500, 'Something went wrong');
    }
}