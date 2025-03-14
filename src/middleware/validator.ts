import { sendResponse } from "@utility/api";
import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import path from "path";

const UploadAttachmentsValidationRules = () => {
    return [
        body('ids')
            .custom((value, { req }) => {
                if (!req.body.ids) {
                    throw new Error('Ids are required');
                }
                const ids = req.body.ids;
                if ((Array.isArray(ids) && ids.length !== req.files.length) || (typeof ids === 'string' && req.files.length != 1)) {
                    throw new Error('Ids must be equal to number of files uploaded');
                }

                for (const id of ids) {
                    if (typeof id != 'string' || !id || id.length > 255) {
                        throw new Error('id must be a string less than 255 characters');
                    }
                }

                return true;
            }),
        body('attachments')
            .custom((value, { req }) => {
                if (!req.files) {
                    throw new Error('No files uploaded.');
                }
                const allowedExtensions = ['.doc', '.docx', '.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.csv'];
                for (const file of req.files) {
                    if (file.originalname.length > 100) {
                        throw new Error('File name must be less than 100 characters');
                    }
                    const fileExtension = path.extname(file.originalname).toLowerCase();
                    if (!allowedExtensions.includes(fileExtension)) {
                        throw new Error('Invalid file extension, allowed extensions are .doc, .docx, .pdf, .jpg, .jpeg, .png, .xlsx, .csv');
                    }
                    const fileName = file.originalname.split('.')[0];
                    if (fileName.length > 100) {
                        throw new Error('File name must be less than 100 characters');
                    }
                }

                return true;
            }),
    ]
}

const ValidateReqParams = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors: Record<string, any>[] = [];
    errors.array().forEach(err => {
        if (err.type === 'field') {
            extractedErrors.push({ [err.path]: err.msg })
        }
    })

    sendResponse(res, 422, 'Invalid or missing parameters', [], extractedErrors);
}

export {
    UploadAttachmentsValidationRules,
    ValidateReqParams
}