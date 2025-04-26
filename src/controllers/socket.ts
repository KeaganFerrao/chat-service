import { MessageService, TransactionManager } from "../interfaces/messages";
import { Socket } from "socket.io"
import { AttachmentsCreationAttributes, AttachmentsInstance } from '../models/postgres/attachments';
import { validateAckMessagePayload, validateAckNotificationPayload, validateChannelListPayload, validateDownloadAttachmentPayload, validateListMessagesPayload, validateNotificationMessagesPayload, validateReachUserPayload, validateSendMessagePayload, validateUserListPayload } from "@utility/message";
import { Logger } from "../interfaces/logger";
import { FileSystemUtils } from "../interfaces/filesystem";

export class SocketController {
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

    ReachUser = (socket: Socket) => async (payload: { userId: string }, callback: any) => {
        if (typeof callback !== 'function') {
            return;
        }

        const transaction = await this.transactionManager.startTransaction();
        try {
            const userId = payload.userId;
            const baseUserId = socket.data.payload.baseUserId;

            const validation = validateReachUserPayload(payload);
            if (!validation.success) {
                await this.transactionManager.rollbackTransaction(transaction);
                return callback({
                    success: false,
                    data: [],
                    message: validation.message,
                    errors: []
                });
            }

            if (userId === baseUserId) {
                await this.transactionManager.rollbackTransaction(transaction);
                return callback({
                    success: false,
                    data: [],
                    message: 'Cannot reach self',
                    errors: []
                });
            }

            const user = await this.messageService.getBaseUser(userId, transaction);
            if (!user) {
                await this.transactionManager.rollbackTransaction(transaction);
                return callback({
                    success: false,
                    data: [],
                    message: 'User not found',
                    errors: []
                });
            }

            //TODO: Need to add validaton to check if user is allowed to reach

            const channelName = userId > baseUserId ? `user:${baseUserId}:${userId}` : `user:${userId}:${baseUserId}`;
            const channelExists = await this.messageService.getChannelByName(channelName, transaction);
            if (channelExists) {
                await this.transactionManager.rollbackTransaction(transaction);
                return callback({
                    success: true,
                    data: {
                        channelId: channelExists.id
                    },
                    message: 'Channel already exists',
                    errors: []
                });
            }

            const channel = await this.messageService.createChannel(channelName, 'private', transaction);

            await this.messageService.createUserChannels([
                { baseUserId: baseUserId, toBaseUserId: userId, channelId: channel.id },
                { baseUserId: userId, toBaseUserId: baseUserId, channelId: channel.id }
            ], transaction);

            await this.transactionManager.commitTransaction(transaction);

            return callback({
                success: true,
                data: {
                    channelId: channel.id
                },
                message: 'Channel created successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error creating channel');
            this.logger.error(error);
            await this.transactionManager.rollbackTransaction(transaction);

            return callback({
                success: false,
                data: [],
                message: 'Error creating channel' + error,
                errors: []
            })
        }
    }

    ListUsers = (socket: Socket) => async (payload: { page: number, size: number, search?: string }, callback: any) => {
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

            const users = await this.messageService.listUsers(userId, size, offset, search);

            return callback({
                success: true,
                data: users,
                message: 'Users listed successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error listing users');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error listing users',
                errors: []
            })
        }
    }

    ListChannels = (socket: Socket) => async (payload: { page: number, size: number, search?: string }, callback: any) => {
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

            this.logger.debug(`Listing channels for user ${userId}`);
            const list = await this.messageService.listUserChannels(userId, size, offset, search);

            return callback({
                success: true,
                data: list,
                message: 'Channel listed successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error listing channels');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error listing channels',
                errors: []
            })
        }
    }

    SendMessage = (socket: Socket) => async (payload: { channelId: string, content: string, attachments: string[] }, callback: any) => {
        if (typeof callback !== 'function') {
            return;
        }

        const transaction = await this.transactionManager.startTransaction();
        try {
            const { baseUserId: fromUserId, firstName, lastName } = socket.data.payload;
            const { channelId, content, attachments } = payload;

            const validation = validateSendMessagePayload(payload);
            if (!validation.success) {
                await this.transactionManager.rollbackTransaction(transaction);
                return callback({
                    success: false,
                    data: [],
                    message: validation.message,
                    errors: []
                });
            }

            const channel = await this.messageService.getChannel(channelId, fromUserId);
            if (!channel) {
                await this.transactionManager.rollbackTransaction(transaction);
                return callback({
                    success: false,
                    data: [],
                    message: 'Channel not found',
                    errors: []
                });
            }

            //TODO: Need to add validation to check if user is allowed to send message in channel

            let attachmentData: AttachmentsCreationAttributes[] = [];
            if (attachments && attachments.length > 0) {
                this.logger.debug(`Creating attachments for channel ${channelId}, from user ${fromUserId}`);
                attachmentData = await this.messageService.createAttachment(fromUserId, channelId, attachments, transaction);
            }

            const formattedAttachments = attachmentData.map(attachment => ({ id: attachment.id!, fileName: attachment.fileName }));
            this.logger.debug(`Creating message for channel ${channelId}, from user ${fromUserId}`);
            this.logger.debug(`Message content: ${content}`);
            this.logger.debug(`Message attachments: ${JSON.stringify(formattedAttachments)}`);

            const message = await this.messageService.createMessage(fromUserId, channelId, content, formattedAttachments, transaction);
            await this.messageService.updateMessageOffset(fromUserId, channelId, transaction);

            this.logger.debug(`Getting users in channel ${channelId}`);
            const usersInChannel = await this.messageService.getUsersInChannel(channelId, fromUserId, transaction);

            this.logger.debug(`Sending message to users in channel ${channelId}`);
            usersInChannel.forEach(user => {
                socket
                    .to(`user:${user.baseUserId}`)
                    .emit('message:new', {
                        from: {
                            id: fromUserId,
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

            await this.transactionManager.commitTransaction(transaction);

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
            this.logger.error('Error sending message');
            this.logger.error(error);
            await this.transactionManager.rollbackTransaction(transaction);

            return callback({
                success: false,
                data: [],
                message: 'Error sending message',
                errors: []
            })
        }
    }

    DownloadAttachment = (socket: Socket) => async (payload: { attachmentId: string, channelId: string }, callback: any) => {
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

            const channel = await this.messageService.getChannel(channelId, baseUserId);
            if (!channel) {
                return callback({
                    success: false,
                    data: [],
                    message: 'Channel not found',
                    errors: []
                });
            }

            const attachment = await this.messageService.getAttachment(attachmentId, channelId);
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

            const url = await this.fileSystemUtils.generateUrl(`attachments/${attachmentId}`, 5 * 60);
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
            this.logger.error('Error fetching attachment');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error fetching attachment',
                errors: []
            })
        }
    }

    AckMessage = (socket: Socket) => async (payload: { channelId: string, messageId: number }, callback: any) => {
        if (typeof callback !== 'function') {
            return;
        }

        try {
            const { baseUserId } = socket.data.payload;
            const { channelId } = payload;

            const validation = validateAckMessagePayload(payload);
            if (!validation.success) {
                return callback({
                    success: false,
                    data: [],
                    message: validation.message,
                    errors: []
                });
            }

            this.logger.debug(`Acknowledging message in channel ${channelId} for user ${baseUserId}`);
            await this.messageService.ackMessage(baseUserId, channelId);

            return callback({
                success: true,
                data: [],
                message: 'Message acknowledged successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error acknowledging message');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error acknowledging message',
                errors: []
            })
        }
    }

    ListMessages = (socket: Socket) => async (payload: { channelId: string, page: number, size: number }, callback: any) => {
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

            const channel = await this.messageService.getChannel(channelId, baseUserId);
            if (!channel) {
                return callback({
                    success: false,
                    data: [],
                    message: 'Channel not found',
                    errors: []
                })
            }

            const data = await this.messageService.listMessages(channelId, size, offset);
            return callback({
                success: true,
                data,
                message: 'Messages listed successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error listing messages');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error listing messages',
                errors: []
            })
        }
    }

    ListNotifications = (socket: Socket) => async (payload: { page: number, size: number }, callback: any) => {
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

            const data = await this.messageService.listNotifications(baseUserId, type, size, offset);
            return callback({
                success: true,
                data,
                message: 'Notifications listed successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error listing notifications');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error listing notifications',
                errors: []
            })
        }
    }

    GetNotificationUnreadCount = (socket: Socket) => async (payload: {}, callback: any) => {
        if (typeof callback !== 'function') {
            return;
        }

        try {
            const { baseUserId, type } = socket.data.payload;

            const data = await this.messageService.getNotificationUnreadCount(baseUserId, type);
            return callback({
                success: true,
                data,
                message: 'Notifications unread count fetched successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error listing notifications unread count');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error listing notifications unread count',
                errors: []
            })
        }
    }

    AckNotification = (socket: Socket) => async (payload: { notificationId: number }, callback: any) => {
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

            this.logger.debug(`Acknowledging notification ${notificationId} for user ${baseUserId}`);
            await this.messageService.ackNotification(baseUserId);

            return callback({
                success: true,
                data: [],
                message: 'Notification acknowledged successfully',
                errors: []
            });
        } catch (error) {
            this.logger.error('Error acknowledging notification');
            this.logger.error(error);

            return callback({
                success: false,
                data: [],
                message: 'Error acknowledging notification',
                errors: []
            })
        }
    }

}