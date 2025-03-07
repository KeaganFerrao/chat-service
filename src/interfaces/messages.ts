import { AttachmentsCreationAttributes } from "@models/attachments";
import { BaseUserAttributes } from "@models/baseUser";
import { ChannelAttributes } from "@models/channel";
import { MessageAttributes } from "@models/message";
import { NotificationsAttributes } from "@models/notifications";
import { userChannelAttributes } from "@models/userChannel";
import { Transaction } from "sequelize";

interface MessageService {
    getBaseUser(baseUserId: number, transaction?: Transaction): Promise<BaseUserAttributes | null>;
    createChannel(name: string, type: 'private', transaction: Transaction): Promise<ChannelAttributes>;
    getChannelByName(name: string, transaction: Transaction): Promise<ChannelAttributes | null>;
    createUserChannels(data: { baseUserId: number; toBaseUserId: number; channelId: string }[], transaction: Transaction): Promise<void>;
    listUsers(userId: number, limit: number, offset: number, search?: string): Promise<{ rows: BaseUserAttributes[]; count: number }>;
    listUserChannels(userId: number, limit: number, offset: number, search?: string): Promise<{ rows: any[]; count: number }>;
    createMessage(fromBaseUserId: number, channelId: string, content: string | null, attachments: { fileName: string; id: string }[] | null, transaction: Transaction): Promise<MessageAttributes>;
    updateMessageOffset(userId: number, channelId: string, messageId: bigint, transaction: Transaction): Promise<void>;
    createAttachment(baseUserId: number, channelId: string, fileNames: string[], transaction: Transaction): Promise<AttachmentsCreationAttributes[]>;
    getAttachment(attachmentId: string, channelId: string): Promise<AttachmentsCreationAttributes | null>;
    getUsersInChannel(channelId: string, exceptionUserId: number, transaction: Transaction): Promise<userChannelAttributes[]>;
    getUnreadMessageCount(userId: number, channelId: string): Promise<number>;
    ackMessage(userId: number, channelId: string, messageId: number): Promise<void>;
    ackNotification(userId: number, notificationId: number): Promise<void>;
    getChannel(channelId: string, userId: number): Promise<userChannelAttributes | null>;
    listMessages(channelId: string, limit: number, offset: number): Promise<{ rows: MessageAttributes[]; count: number }>;
    listNotifications(baseUserId: number, type: string, limit: number, offset: number): Promise<{ rows: NotificationsAttributes[]; count: number }>;
    getNotificationUnreadCount(baseUserId: number, type: string): Promise<number>;
    getAttachmentById(attachmentId: string, baseUserId: string, transaction: Transaction): Promise<AttachmentsCreationAttributes | null>;
    updateAttachmentUploadSuccess(attachmentIds: string[], transaction: Transaction): Promise<void>;
    updateAttachmentUploadFailure(attachmentIds: string[], transaction: Transaction): Promise<void>;
}

export { MessageService };
