import { getAttachmentById } from "@models/helpers/messages";
import logger from "@setup/logger";
import multer from "@setup/multer";
import { ProtectedPayload } from "@type/utility";
import { RequestWithPayload, WithTransaction } from "@type/utility";
import { sendResponse } from "@utility/api";
import { NextFunction, Response } from "express";
import { MulterError } from "multer";

const ValidateMultipleFileUpload = (name: string) => (async (req: WithTransaction, res: Response, next: NextFunction) => {
    const transaction = req.transaction!;
    try {
        const upload = multer(5).array(name, 5);
        upload(req, res, async (err) => {
            if (err instanceof MulterError) {
                switch (err.code) {
                    case 'LIMIT_UNEXPECTED_FILE':
                        await transaction.rollback();
                        return sendResponse(res, 422, `Only a single file with the field name: ${name} is allowed`);
                    case 'LIMIT_FILE_SIZE':
                        await transaction.rollback();
                        return sendResponse(res, 422, 'Max. allowed file size is 5MB');
                    default:
                        await transaction.rollback();
                        return sendResponse(res, 400, err.code);
                }
            } else if (err) {
                logger.error(err)
                await transaction.rollback();
                return sendResponse(res, 500, 'Error uploading file');
            }

            next();
        })
    } catch (error) {
        logger.error('Error validating multiple file upload');
        logger.error(error);
        await transaction.rollback();
        sendResponse(res, 500, 'Internal Server Error');
    }
})

const ValidateAttachmentUpload = async (req: RequestWithPayload<ProtectedPayload>, res: Response, next: NextFunction) => {
    const transaction = req.transaction!;
    try {
        const userId = req.payload!.baseUserId;
        const ids = req.body.ids;

        if (Array.isArray(ids)) {
            for (const id of ids) {
                const attachment = await getAttachmentById(id, userId, transaction);
                if (!attachment) {
                    await transaction.rollback();
                    return sendResponse(res, 404, `Attachment ${id} not found`);
                }
            }
        } else {
            const attachment = await getAttachmentById(ids, userId, transaction);
            if (!attachment) {
                await transaction.rollback();
                return sendResponse(res, 404, 'Attachment not found');
            }
        }

        next();
    } catch (error) {
        logger.error('Error validating attachment upload');
        logger.error(error);
        await transaction.rollback();
        sendResponse(res, 500, 'Internal Server Error');
    }
}

export {
    ValidateMultipleFileUpload,
    ValidateAttachmentUpload
}