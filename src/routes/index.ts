import { MessageContoller } from "@controllers/messages";
import { AuthMiddleware } from "@middleware/auth";
import { MessageMiddleware } from "@middleware/messages";
import { UploadAttachmentsValidationRules } from "@middleware/validator";
import { ValidateReqParams } from "@middleware/validator";
import { DB_TYPE } from "@setup/secrets";
import { MongoTransactionManager } from "@utility/mongoTransactionManager";
import { SequelizeTransactionManager } from "@utility/sequelizeTransactionManager";
import { Router } from "express";
import { MessageService, TransactionManager } from "../interfaces/messages";
import { MongoMessageService } from "../services/mongoMessages";
import { SequelizeMessageService } from "../services/sequelizeMessages";
import { FileLogger } from "@setup/logger";

let messageService: MessageService;
let transactionManager: TransactionManager;
if (DB_TYPE == 'mongo') {
    messageService = new MongoMessageService();
    transactionManager = new MongoTransactionManager();
} else {
    messageService = new SequelizeMessageService();
    transactionManager = new SequelizeTransactionManager();
}

const fileLogger = FileLogger.getInstance();

const authMiddleware = new AuthMiddleware(messageService, fileLogger);
const messageMiddleware = new MessageMiddleware(messageService, fileLogger);
const messageController = new MessageContoller(messageService, transactionManager, fileLogger);

const router = Router();

router.post('/upload-attachment', authMiddleware.ValidateToken, messageMiddleware.ValidateMultipleFileUpload('attachments'), UploadAttachmentsValidationRules(), ValidateReqParams, messageMiddleware.ValidateAttachmentUpload, messageController.UploadAttachment);

export default router;
