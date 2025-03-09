import { updateAttachmentUploadFailure, updateAttachmentUploadSuccess } from "@models/postgres/helpers/messages";
import logger from "@setup/logger";
import { ProtectedPayload } from "@type/utility";
import { RequestWithPayload } from "@type/utility"
import { sendResponse } from "@utility/api";
import { uploadToBucket } from "@utility/storage";
import { NextFunction, Response } from "express"

const UploadAttachment = async (req: RequestWithPayload<ProtectedPayload>, res: Response, next: NextFunction) => {
    const transaction = req.transaction!;
    try {
        const ids = req.body.ids;
        const files = req.files!;

        const uploadStatus = await Promise.all<{ id: string, success: boolean }>((files as Express.Multer.File[]).map(async (file, index) => {
            try {
                await uploadToBucket(file.buffer, `attachments/${files.length == 1 ? ids : ids[index]}`, file.mimetype);
                return {
                    id: files.length == 1 ? ids : ids[index],
                    success: true
                }
            } catch (error) {
                return {
                    id: files.length == 1 ? ids : ids[index],
                    success: false
                }
            }
        }))

        const successIds = uploadStatus.filter(status => status.success).map(status => status.id);
        const failedIds = uploadStatus.filter(status => !status.success).map(status => status.id);

        await updateAttachmentUploadSuccess(successIds, transaction);
        await updateAttachmentUploadFailure(failedIds, transaction);

        await transaction.commit();

        sendResponse(res, 200, 'Attachment files processed successfully', { successIds, failedIds });
    } catch (error) {
        logger.error('Error uploading attachments');
        logger.error(error);
        await transaction.rollback();
        next(error);
    }
}

export {
    UploadAttachment
}