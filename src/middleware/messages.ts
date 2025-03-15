import multer from "@setup/multer";
import { ProtectedPayload } from "@type/utility";
import { RequestWithPayload } from "@type/utility";
import { sendResponse } from "@utility/api";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { MessageService } from "../interfaces/messages";
import { Logger } from "../interfaces/logger";

export class MessageMiddleware {
    private messageService: MessageService;
    private logger: Logger;

    constructor(messageService: MessageService, logger: Logger) {
        this.messageService = messageService;
        this.logger = logger;
    }

    ValidateMultipleFileUpload = (name: string) => (async (req: Request, res: Response, next: NextFunction) => {
        try {
            const upload = multer(5).array(name, 5);
            upload(req, res, async (err) => {
                if (err instanceof MulterError) {
                    switch (err.code) {
                        case 'LIMIT_UNEXPECTED_FILE':
                            return sendResponse(res, 422, `Only a single file with the field name: ${name} is allowed`);
                        case 'LIMIT_FILE_SIZE':
                            return sendResponse(res, 422, 'Max. allowed file size is 5MB');
                        default:
                            return sendResponse(res, 400, err.code);
                    }
                } else if (err) {
                    this.logger.error(err)
                    return sendResponse(res, 500, 'Error uploading file');
                }

                next();
            })
        } catch (error) {
            this.logger.error('Error validating multiple file upload');
            this.logger.error(error);
            sendResponse(res, 500, 'Internal Server Error');
        }
    })

    ValidateAttachmentUpload = async (req: RequestWithPayload<ProtectedPayload>, res: Response, next: NextFunction) => {
        try {
            const userId = req.payload!.baseUserId;
            const ids = req.body.ids;

            if (Array.isArray(ids)) {
                for (const id of ids) {
                    const attachment = await this.messageService.getAttachmentById(id, userId);
                    if (!attachment) {
                        return sendResponse(res, 404, `Attachment ${id} not found`);
                    }
                }
            } else {
                const attachment = await this.messageService.getAttachmentById(ids, userId);
                if (!attachment) {
                    return sendResponse(res, 404, 'Attachment not found');
                }
            }

            next();
        } catch (error) {
            this.logger.error('Error validating attachment upload');
            this.logger.error(error);
            sendResponse(res, 500, 'Internal Server Error');
        }
    }
}