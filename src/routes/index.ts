import { UploadAttachment } from "@controllers/messages";
import { ValidateToken } from "@middleware/auth";
import { ValidateAttachmentUpload, ValidateMultipleFileUpload } from "@middleware/messages";
import { UploadAttachmentsValidationRules } from "@middleware/validator";
import { ValidateReqParams } from "@middleware/validator";
import { Router } from "express";

const router = Router();

router.post('/upload-attachment', ValidateToken, ValidateMultipleFileUpload('attachments'), UploadAttachmentsValidationRules(), ValidateReqParams, ValidateAttachmentUpload, UploadAttachment);

export default router;
