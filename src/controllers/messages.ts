import { sendResponse } from "@utility/api";
import { NextFunction, Request, Response } from "express"
import { MessageService, TransactionManager } from "../interfaces/messages";
import { Logger } from "../interfaces/logger";
import { FileSystemUtils } from "../interfaces/filesystem";

export class MessageContoller {
    private messageService: MessageService;
    private transactionManager: TransactionManager;
    private logger: Logger;
    private fileSystemUtils: FileSystemUtils;

    constructor(service: MessageService, transactionManager: TransactionManager, fileSystemUtils: FileSystemUtils, logger: Logger) {
        this.messageService = service;
        this.transactionManager = transactionManager;
        this.logger = logger;
        this.fileSystemUtils = fileSystemUtils;
    }

    UploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
        const transaction = await this.transactionManager.startTransaction();
        try {
            const ids = req.body.ids;
            const files = req.files!;

            const uploadStatus = await Promise.all<{ id: string, success: boolean }>((files as Express.Multer.File[]).map(async (file, index) => {
                try {
                    await this.fileSystemUtils.upload(file.buffer, `attachments/${files.length == 1 ? ids : ids[index]}`, file.mimetype);
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

            await this.messageService.updateAttachmentUploadSuccess(successIds, transaction);
            await this.messageService.updateAttachmentUploadFailure(failedIds, transaction);

            await this.transactionManager.commitTransaction(transaction);

            sendResponse(res, 200, 'Attachment files processed successfully', { successIds, failedIds });
        } catch (error) {
            this.logger.error('Error uploading attachments');
            this.logger.error(error);
            await this.transactionManager.rollbackTransaction(transaction);
            next(error);
        }
    }
}