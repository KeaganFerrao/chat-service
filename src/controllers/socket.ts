import { ackMessage, ackNotification, createAttachment, createChannel, createMessage, createUserChannels, getAttachment, getChannel, getChannelByName, getNotificationUnreadCount, getUsersInChannel, listMessages, listNotifications, listUserChannels, listUsers, updateMessageOffset } from "@models/helpers/messages";
import sequelize from "@setup/database";
import logger from "@setup/logger";
import { Socket } from "socket.io"
import { AttachmentsInstance } from '../models/attachments';
import { getObjectUrl } from "@utility/storage";
import { getBaseUser } from "@models/helpers/messages";
import { validateAckMessagePayload, validateAckNotificationPayload, validateChannelListPayload, validateDownloadAttachmentPayload, validateListMessagesPayload, validateNotificationMessagesPayload, validateReachUserPayload, validateSendMessagePayload, validateUserListPayload } from "@utility/message";

const ReachUser = (socket: Socket) => async (payload: { userId: number }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    const transaction = await sequelize.transaction();
    try {
        const userId = payload.userId;
        const baseUserId = socket.data.payload.baseUserId;

        const validation = validateReachUserPayload(payload);
        if (!validation.success) {
            await transaction.rollback();
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        if (userId === baseUserId) {
            await transaction.rollback();
            return callback({
                success: false,
                data: [],
                message: 'Cannot reach self',
                errors: []
            });
        }

        const user = await getBaseUser(userId, transaction);
        if (!user) {
            await transaction.rollback();
            return callback({
                success: false,
                data: [],
                message: 'User not found',
                errors: []
            });
        }

        //TODO: Need to add validaton to check if user is allowed to reach

        const channelName = userId > baseUserId ? `user:${baseUserId}:${userId}` : `user:${userId}:${baseUserId}`;
        const channelExists = await getChannelByName(channelName, transaction);
        if (channelExists) {
            await transaction.commit();
            return callback({
                success: true,
                data: {
                    channelId: channelExists.id
                },
                message: 'Channel already exists',
                errors: []
            });
        }

        const channel = await createChannel(channelName, 'private', transaction);

        await createUserChannels([
            { baseUserId: baseUserId, toBaseUserId: userId, channelId: channel.id },
            { baseUserId: userId, toBaseUserId: baseUserId, channelId: channel.id }
        ], transaction);

        await transaction.commit();

        return callback({
            success: true,
            data: {
                channelId: channel.id
            },
            message: 'Channel created successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error creating channel');
        logger.error(error);
        await transaction.rollback();

        return callback({
            success: false,
            data: [],
            message: 'Error creating channel' + error,
            errors: []
        })
    }
}

const ListUsers = (socket: Socket) => async (payload: { page: number, size: number, search?: string }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const userId = socket.data.payload.baseUserId;
        const { page, size, search } = payload;

        const validation = validateUserListPayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        const offset = Number(size) * (Number(page) - 1);

        const users = await listUsers(userId, size, offset, search);

        return callback({
            success: true,
            data: users,
            message: 'Users listed successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error listing users');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error listing users',
            errors: []
        })
    }
}

const ListChannels = (socket: Socket) => async (payload: { page: number, size: number, search?: string }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const userId = socket.data.payload.baseUserId;
        const { page, size, search } = payload;

        const validation = validateChannelListPayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        const offset = Number(size) * (Number(page) - 1);

        logger.debug(`Listing channels for user ${userId}`);
        const list = await listUserChannels(userId, size, offset, search);

        return callback({
            success: true,
            data: list,
            message: 'Channel listed successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error listing channels');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error listing channels',
            errors: []
        })
    }
}

const SendMessage = (socket: Socket) => async (payload: { channelId: string, content: string, attachments: string[] }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    const transaction = await sequelize.transaction();
    try {
        const { baseUserId: fromUserId, firstName, lastName } = socket.data.payload;
        const { channelId, content, attachments } = payload;

        const validation = validateSendMessagePayload(payload);
        if (!validation.success) {
            await transaction.rollback();
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        const channel = await getChannel(channelId, fromUserId);
        if (!channel) {
            await transaction.rollback();
            return callback({
                success: false,
                data: [],
                message: 'Channel not found',
                errors: []
            });
        }

        //TODO: Need to add validation to check if user is allowed to send message in channel

        let attachmentData: AttachmentsInstance[] = [];
        if (attachments.length > 0) {
            logger.debug(`Creating attachments for channel ${channelId}, from user ${fromUserId}`);
            attachmentData = await createAttachment(fromUserId, channelId, attachments, transaction);
        }

        const formattedAttachments = attachmentData.map(attachment => ({ id: attachment.id, fileName: attachment.fileName }));
        logger.debug(`Creating message for channel ${channelId}, from user ${fromUserId}`);
        logger.debug(`Message content: ${content}`);
        logger.debug(`Message attachments: ${JSON.stringify(formattedAttachments)}`);

        const message = await createMessage(fromUserId, channelId, content, formattedAttachments, transaction);
        await updateMessageOffset(fromUserId, channelId, message.id, transaction);

        logger.debug(`Getting users in channel ${channelId}`);
        const usersInChannel = await getUsersInChannel(channelId, fromUserId, transaction);

        logger.debug(`Sending message to users in channel ${channelId}`);
        usersInChannel.forEach(user => {
            socket
                .to(`user:${user.baseUserId}`)
                .emit('message:new', {
                    from: {
                        id:fromUserId,
                        firstName,
                        lastName
                    },
                    messageId: message.id,
                    channelId,
                    totalUnreadMessages: user.unreadMessageCount,
                    content,
                    attachments: formattedAttachments,
                    sentOn: new Date()
                });
        });

        await transaction.commit();

        return callback({
            success: true,
            data: {
                messageId: message.id,
                attachments: formattedAttachments,
            },
            message: 'Message sent successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error sending message');
        logger.error(error);
        await transaction.rollback();

        return callback({
            success: false,
            data: [],
            message: 'Error sending message',
            errors: []
        })
    }
}

const DownloadAttachment = (socket: Socket) => async (payload: { attachmentId: string, channelId: string }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const { baseUserId } = socket.data.payload;
        const { attachmentId, channelId } = payload;

        const validation = validateDownloadAttachmentPayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        const channel = await getChannel(channelId, baseUserId);
        if (!channel) {
            return callback({
                success: false,
                data: [],
                message: 'Channel not found',
                errors: []
            });
        }

        const attachment = await getAttachment(attachmentId, channelId);
        if (!attachment) {
            return callback({
                success: false,
                data: [],
                message: 'Attachment not found',
                errors: []
            });
        }

        if (attachment.hasUploadFailed) {
            return callback({
                success: false,
                data: [],
                message: 'Failed to upload attachment, please try again',
                errors: []
            });
        }

        if (attachment.isUploading) {
            return callback({
                success: true,
                data: [],
                message: 'Uploading attachment, please try again in a moment',
                errors: []
            })
        }

        if (!attachment.isUploaded) {
            return callback({
                success: false,
                data: [],
                message: 'Attachment not uploaded',
                errors: []
            })
        }

        const url = await getObjectUrl(`attachments/${attachmentId}`, 5 * 60);
        return callback({
            success: true,
            data: {
                url,
                fileName: attachment.fileName
            },
            message: 'Attachment fetched successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error fetching attachment');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error fetching attachment',
            errors: []
        })
    }
}

const AckMessage = (socket: Socket) => async (payload: { channelId: string, messageId: number }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const { baseUserId } = socket.data.payload;
        const { channelId, messageId } = payload;

        const validation = validateAckMessagePayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        logger.debug(`Acknowledging message ${messageId} in channel ${channelId} for user ${baseUserId}`);
        await ackMessage(baseUserId, channelId, messageId);

        return callback({
            success: true,
            data: [],
            message: 'Message acknowledged successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error acknowledging message');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error acknowledging message',
            errors: []
        })
    }
}

const ListMessages = (socket: Socket) => async (payload: { channelId: string, page: number, size: number }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const { baseUserId } = socket.data.payload;
        const { channelId, page, size } = payload;

        const validation = validateListMessagesPayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        const offset = Number(size) * (Number(page) - 1);

        const channel = await getChannel(channelId, baseUserId);
        if (!channel) {
            return callback({
                success: false,
                data: [],
                message: 'Channel not found',
                errors: []
            })
        }

        const data = await listMessages(channelId, size, offset);
        return callback({
            success: true,
            data,
            message: 'Messages listed successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error listing messages');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error listing messages',
            errors: []
        })
    }
}

const ListNotifications = (socket: Socket) => async (payload: { page: number, size: number }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const { baseUserId, type } = socket.data.payload;
        const { page, size } = payload;

        const validation = validateNotificationMessagesPayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        const offset = Number(size) * (Number(page) - 1);

        const data = await listNotifications(baseUserId, type, size, offset);
        return callback({
            success: true,
            data,
            message: 'Notifications listed successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error listing notifications');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error listing notifications',
            errors: []
        })
    }
}

const GetNotificationUnreadCount = (socket: Socket) => async (payload: {}, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const { baseUserId, type } = socket.data.payload;

        const data = await getNotificationUnreadCount(baseUserId, type);
        return callback({
            success: true,
            data,
            message: 'Notifications unread count fetched successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error listing notifications unread count');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error listing notifications unread count',
            errors: []
        })
    }
}

const AckNotification = (socket: Socket) => async (payload: { notificationId: number }, callback: any) => {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        const { baseUserId } = socket.data.payload;
        const { notificationId } = payload;

        const validation = validateAckNotificationPayload(payload);
        if (!validation.success) {
            return callback({
                success: false,
                data: [],
                message: validation.message,
                errors: []
            });
        }

        logger.debug(`Acknowledging notification ${notificationId} for user ${baseUserId}`);
        await ackNotification(baseUserId, notificationId);

        return callback({
            success: true,
            data: [],
            message: 'Notification acknowledged successfully',
            errors: []
        });
    } catch (error) {
        logger.error('Error acknowledging notification');
        logger.error(error);

        return callback({
            success: false,
            data: [],
            message: 'Error acknowledging notification',
            errors: []
        })
    }
}

export {
    ReachUser,
    ListChannels,
    SendMessage,
    AckMessage,
    ListMessages,
    DownloadAttachment,
    ListUsers,
    ListNotifications,
    AckNotification,
    GetNotificationUnreadCount
}