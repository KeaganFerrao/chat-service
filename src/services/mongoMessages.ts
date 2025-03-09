import { MessageService } from "../interfaces/messages";
import { ClientSession, Types } from 'mongoose';
import { BaseUser, Channel, Message, Notification, UserChannel, UserNotification, Attachment } from '../models/mongo';
import { BaseUserAttributes } from "@models/postgres/baseUser";
import { ChannelAttributes } from "@models/postgres/channel";
import { AttachmentsCreationAttributes } from "@models/postgres/attachments";
import { MessageAttributes } from "@models/postgres/message";
import { NotificationsAttributes } from "@models/postgres/notifications";
import { userChannelAttributes } from "@models/postgres/userChannel";

export class MongoMessageService implements MessageService {
    listUserChannels = async (userId: string, limit: number, offset: number, search?: string): Promise<{ rows: any[]; count: number }> => {
        const query = { baseUserId: userId };
        if (search) {
            // query.$or = [
            //     { firstName: new RegExp(search, 'i') },
            //     { lastName: new RegExp(search, 'i') }
            // ];
        }
        const userChannels = await UserChannel.find(query, 'id baseUserId toBaseUserId channelId messageOffset').limit(limit).skip(offset).sort('messageOffset');

        return { rows: userChannels, count: userChannels.length };
    }

    getUsersInChannel = async (channelId: string, exceptionUserId: string, session: ClientSession): Promise<userChannelAttributes[]> => {
        return UserChannel.find({ channelId, baseUserId: { $ne: exceptionUserId } }, 'baseUserId').session(session);
    }

    ackNotification = async (userId: string): Promise<void> => {
        await UserNotification.updateOne(
            { baseUserId: userId, notificationOffset: { $lt: new Date() } },
            { notificationOffset: new Date() }
        );

    }

    getChannel = async (channelId: string, userId: string): Promise<userChannelAttributes | null> => {
        return UserChannel.findOne({ channelId, baseUserId: userId }, 'id baseUserId toBaseUserId channelId messageOffset');
    }

    getAttachmentById = async (attachmentId: string, baseUserId: string, session: ClientSession): Promise<AttachmentsCreationAttributes | null> => {
        return Attachment.findOne({ _id: attachmentId, baseUserId }, 'id fileName isUploaded isUploading hasUploadFailed').session(session);
    }

    getBaseUser = async (baseUserId: string, session: ClientSession): Promise<BaseUserAttributes | null> => {
        return await BaseUser.findOne({ _id: baseUserId, isDeleted: false }, 'id firstName lastName email role').session(session);
    };

    createChannel = async (name: string, type: string, session: ClientSession): Promise<ChannelAttributes> => {
        const channel = await Channel.create({ name, type }, { session });
        return channel[0];
    };

    getChannelByName = async (name: string, session: ClientSession): Promise<ChannelAttributes | null> => {
        return Channel.findOne({ name }, '_id').session(session);
    };

    createUserChannels = async (data: { baseUserId: string, toBaseUserId: string, channelId: string }[], session: ClientSession): Promise<void> => {
        await UserChannel.insertMany(data, { session });
    };

    listUsers = async (userId: string, limit: number, offset: number, search?: string): Promise<{ rows: BaseUserAttributes[]; count: number }> => {
        const query = { isDeleted: false, _id: { $ne: userId } };
        if (search) {
            // query.$or = [
            //     { firstName: new RegExp(search, 'i') },
            //     { lastName: new RegExp(search, 'i') }
            // ];
        }
        const users = await BaseUser.find(query, 'id firstName lastName type').limit(limit).skip(offset).sort('firstName');

        return { rows: users, count: users.length };
    };

    createMessage = async (fromBaseUserId: string, channelId: string, content: string, attachments: { fileName: string, id: string }[], session: ClientSession): Promise<MessageAttributes> => {
        const messageData = { fromBaseUserId, channelId, sentOn: new Date(), content, attachments: [] };
        // if (attachments && attachments.length) messageData.attachments = attachments;

        const message = await Message.create([messageData], { session });

        return message[0];
    };

    updateMessageOffset = async (userId: string, channelId: string, session: ClientSession): Promise<void> => {
        await UserChannel.updateOne({ baseUserId: userId, channelId }, { messageOffset: new Date() }).session(session);
    };

    createAttachment = async (baseUserId: string, channelId: string, fileNames: string[], session: ClientSession): Promise<AttachmentsCreationAttributes[]> => {
        const attachments = fileNames.map(fileName => ({ baseUserId, channelId, fileName, isUploading: true }));
        return Attachment.insertMany(attachments, { session });
    };

    getAttachment = async (attachmentId: string, channelId: string): Promise<AttachmentsCreationAttributes | null> => {
        return Attachment.findOne({ _id: attachmentId, channelId }, 'id fileName isUploaded isUploading hasUploadFailed');
    };

    getUnreadMessageCount = async (userId: string, channelId: string): Promise<number> => {
        const userChannel = await UserChannel.findOne({ baseUserId: userId, channelId }, 'messageOffset');
        return Message.countDocuments({ channelId, sentOn: { $gt: userChannel?.messageOffset } });
    };

    ackMessage = async (userId: string, channelId: string): Promise<void> => {
        await UserChannel.updateOne(
            { baseUserId: userId, channelId, messageOffset: { $lt: new Date() } },
            { messageOffset: new Date() }
        );
    };

    listMessages = async (channelId: string, limit: number, offset: number): Promise<{ rows: MessageAttributes[]; count: number }> => {
        const messages = await Message.find({ channelId }, 'id content sentOn attachments')
            .populate('fromBaseUserId', 'id firstName lastName email channelId')
            .limit(limit)
            .skip(offset)
            .sort('-sentOn');

        return { rows: messages, count: messages.length };
    };

    listNotifications = async (baseUserId: string, type: string, limit: number, offset: number): Promise<{ rows: NotificationsAttributes[]; count: number }> => {
        const notifications = await Notification.find({
            $or: [
                { baseUserId },
                { broadcastTo: type },
                { broadcastTo: 'all' }
            ]
        }, 'id content sentOn link').limit(limit).skip(offset).sort('-id');

        return { rows: notifications, count: notifications.length };
    };

    getNotificationUnreadCount = async (baseUserId: string, type: string): Promise<number> => {
        const userNotification = await UserNotification.findOne({ baseUserId }, 'notificationOffset');
        return Notification.countDocuments({
            _id: { $gt: userNotification?.notificationOffset ?? 0 },
            $or: [
                { baseUserId },
                { broadcastTo: type },
                { broadcastTo: 'all' }
            ]
        });
    };

    updateAttachmentUploadSuccess = async (attachmentIds: string[], session: ClientSession): Promise<void> => {
        await Attachment.updateMany({ _id: { $in: attachmentIds } }, { isUploading: false, isUploaded: true, hasUploadFailed: false }).session(session);
    };

    updateAttachmentUploadFailure = async (attachmentIds: string[], session: ClientSession): Promise<void> => {
        await Attachment.updateMany({ _id: { $in: attachmentIds } }, { isUploading: false, isUploaded: false, hasUploadFailed: true }).session(session);
    };
}