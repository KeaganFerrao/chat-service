import { AttachmentsCreationAttributes } from "@models/postgres/attachments";
import { BaseUserAttributes } from "@models/postgres/baseUser";
import { ChannelAttributes } from "@models/postgres/channel";
import { MessageAttributes } from "@models/postgres/message";
import { NotificationsAttributes } from "@models/postgres/notifications";
import { userChannelAttributes } from "@models/postgres/userChannel";
import { ClientSession } from "mongoose";
import { Transaction } from "sequelize";

interface MessageService {
    getBaseUser(baseUserId: string, transaction?: Transaction | ClientSession): Promise<BaseUserAttributes | null>;
    createChannel(name: string, type: 'private', transaction: Transaction | ClientSession): Promise<ChannelAttributes>;
    getChannelByName(name: string, transaction: Transaction | ClientSession): Promise<ChannelAttributes | null>;
    createUserChannels(data: { baseUserId: string; toBaseUserId: string; channelId: string }[], transaction: Transaction | ClientSession): Promise<void>;
    listUsers(userId: string, limit: number, offset: number, search?: string): Promise<{ rows: BaseUserAttributes[]; count: number }>;
    listUserChannels(userId: string, limit: number, offset: number, search?: string): Promise<{ rows: any[]; count: number }>;
    createMessage(fromBaseUserId: string, channelId: string, content: string | null, attachments: { fileName: string; id: string }[] | null, transaction: Transaction | ClientSession): Promise<MessageAttributes>;
    updateMessageOffset(userId: string, channelId: string, transaction: Transaction | ClientSession): Promise<void>;
    createAttachment(baseUserId: string, channelId: string, fileNames: string[], transaction: Transaction | ClientSession): Promise<AttachmentsCreationAttributes[]>;
    getAttachment(attachmentId: string, channelId: string): Promise<AttachmentsCreationAttributes | null>;
    getUsersInChannel(channelId: string, exceptionUserId: string, transaction: Transaction | ClientSession): Promise<userChannelAttributes[]>;
    getUnreadMessageCount(userId: string, channelId: string): Promise<number>;
    ackMessage(userId: string, channelId: string): Promise<void>;
    ackNotification(userId: string): Promise<void>;
    getChannel(channelId: string, userId: string): Promise<userChannelAttributes | null>;
    listMessages(channelId: string, limit: number, offset: number): Promise<{ rows: MessageAttributes[]; count: number }>;
    listNotifications(baseUserId: string, type: string, limit: number, offset: number): Promise<{ rows: NotificationsAttributes[]; count: number }>;
    getNotificationUnreadCount(baseUserId: string, type: string): Promise<number>;
    getAttachmentById(attachmentId: string, baseUserId: string, transaction?: Transaction | ClientSession): Promise<AttachmentsCreationAttributes | null>;
    updateAttachmentUploadSuccess(attachmentIds: string[], transaction: Transaction | ClientSession): Promise<void>;
    updateAttachmentUploadFailure(attachmentIds: string[], transaction: Transaction | ClientSession): Promise<void>;
}

interface TransactionManager {
    startTransaction(): Promise<Transaction | ClientSession>;
    commitTransaction(transaction: Transaction | ClientSession): Promise<void>;
    rollbackTransaction(transaction: Transaction | ClientSession): Promise<void>;
}

export { MessageService, TransactionManager };
