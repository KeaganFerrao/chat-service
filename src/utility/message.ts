const validateSendMessagePayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { channelId, content, attachments } = payload;

    if (!channelId || typeof channelId !== 'string') {
        return {
            message: 'Channel ID is required and should be a string',
            success: false
        }
    }

    if (!content && !attachments) {
        return {
            message: 'Content or attachment is required',
            success: false
        }
    }

    if (content && typeof content !== 'string') {
        return {
            message: 'Content should be a string',
            success: false
        }
    }

    if (attachments && !Array.isArray(attachments)) {
        return {
            message: 'Attachments should be an array',
            success: false
        }
    }
    
    if(Array.isArray(attachments)) {
        for (const attachment of attachments) {
            if (typeof attachment !== 'string' || attachment.length > 100) {
                return {
                    message: 'Attachment should be a string of length less than 100',
                    success: false
                }
            }
        }

        if (attachments.length > 5) {
            return {
                message: 'Maximum 5 attachments allowed',
                success: false
            }
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateListMessagesPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { channelId, page, size } = payload;

    if (!channelId && typeof channelId !== 'string') {
        return {
            message: 'Channel ID is required and should be a string',
            success: false
        }
    }

    if (!page || typeof page !== 'number') {
        return {
            message: 'Page should be a number',
            success: false
        }
    }

    if (!size || typeof size !== 'number') {
        return {
            message: 'Size should be a number',
            success: false
        }
    }

    if (size > 100) {
        return {
            message: 'Maximum size should be 100',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateAckMessagePayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { channelId, messageId } = payload;

    if (!channelId || typeof channelId !== 'string') {
        return {
            message: 'Channel ID is required and should be a string',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateDownloadAttachmentPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { attachmentId, channelId } = payload;

    if (!attachmentId || typeof attachmentId !== 'string') {
        return {
            message: 'Attachment ID is required and should be a string',
            success: false
        }
    }

    if (!channelId || typeof channelId !== 'string') {
        return {
            message: 'Channel ID is required and should be a string',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateUserListPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { page, size, search } = payload;

    if (!page || typeof page !== 'number') {
        return {
            message: 'Page should be a number',
            success: false
        }
    }

    if (!size || typeof size !== 'number') {
        return {
            message: 'Size should be a number',
            success: false
        }
    }

    if (size > 100) {
        return {
            message: 'Maximum size should be 100',
            success: false
        }
    }

    if (search && typeof search !== 'string') {
        return {
            message: 'Search should be a string',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateReachUserPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const userId = payload.userId;

    if (!userId || typeof userId !== 'string') {
        return {
            message: 'User ID is required and should be a string',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateChannelListPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { page, size, search } = payload;

    if (!page || typeof page !== 'number') {
        return {
            message: 'Page should be a number',
            success: false
        }
    }

    if (!size || typeof size !== 'number') {
        return {
            message: 'Size should be a number',
            success: false
        }
    }

    if (size > 100) {
        return {
            message: 'Maximum size should be 100',
            success: false
        }
    }

    if (search && typeof search !== 'string') {
        return {
            message: 'Search should be a string',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateNotificationMessagesPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { page, size } = payload;

    if (!page || typeof page !== 'number') {
        return {
            message: 'Page should be a number',
            success: false
        }
    }

    if (!size || typeof size !== 'number') {
        return {
            message: 'Size should be a number',
            success: false
        }
    }

    if (size > 50) {
        return {
            message: 'Maximum size should be 50',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

const validateAckNotificationPayload = (payload: Record<string, any>): { message: string, success: boolean } => {
    const { notificationId } = payload;

    if (!notificationId || typeof notificationId !== 'string') {
        return {
            message: 'Notification ID is required and should be a string',
            success: false
        }
    }

    return {
        message: 'Validated',
        success: true
    }
}

export {
    validateSendMessagePayload,
    validateListMessagesPayload,
    validateAckMessagePayload,
    validateDownloadAttachmentPayload,
    validateUserListPayload,
    validateReachUserPayload,
    validateChannelListPayload,
    validateNotificationMessagesPayload,
    validateAckNotificationPayload
}