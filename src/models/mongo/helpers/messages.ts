import mongoose, { ClientSession, Types } from 'mongoose';
import { BaseUser, Channel, Message, Notification, UserChannel, UserNotification, Attachment } from '../index';

const getBaseUser = async (baseUserId: Types.UUID, session: ClientSession) => {
    return BaseUser.findOne({ _id: baseUserId, isDeleted: false }, 'id firstName lastName email role').session(session);
};

const createChannel = async (name: string, type: string, session: ClientSession) => {
    return Channel.create([{ name, type }], { session });
};

const getChannelByName = async (name: string, session: ClientSession) => {
    return Channel.findOne({ name }, '_id').session(session);
};

const createUserChannels = async (data: { baseUserId: Types.UUID, toBaseUserId: Types.UUID, channelId: Types.UUID }[], session: ClientSession) => {
    return UserChannel.insertMany(data, { session });
};

const listUsers = async (userId: Types.UUID, limit: number, offset: number, search: string | null) => {
    const query = { isDeleted: false, _id: { $ne: userId } };
    if (search) {
        // query.$or = [
        //     { firstName: new RegExp(search, 'i') },
        //     { lastName: new RegExp(search, 'i') }
        // ];
    }
    return BaseUser.find(query, 'id firstName lastName type').limit(limit).skip(offset).sort('firstName');
};

const createMessage = async (fromBaseUserId: Types.UUID, channelId: Types.UUID, content: string, attachments: { fileName: string, id: string }[], session: ClientSession) => {
    const messageData = { fromBaseUserId, channelId, sentOn: new Date(), content, attachments: [] };
    // if (attachments && attachments.length) messageData.attachments = attachments;

    return Message.create([messageData], { session });
};

const updateMessageOffset = async (userId: Types.UUID, channelId: Types.UUID, session: ClientSession) => {
    return UserChannel.updateOne({ baseUserId: userId, channelId }, { messageOffset: new Date() }).session(session);
};

const createAttachment = async (baseUserId: Types.UUID, channelId: Types.UUID, fileNames: string[], session: ClientSession) => {
    const attachments = fileNames.map(fileName => ({ baseUserId, channelId, fileName, isUploading: true }));
    return Attachment.insertMany(attachments, { session });
};

const getAttachment = async (attachmentId: Types.UUID, channelId: Types.UUID) => {
    return Attachment.findOne({ _id: attachmentId, channelId }, 'id fileName isUploaded isUploading hasUploadFailed');
};

const getUnreadMessageCount = async (userId: Types.UUID, channelId: Types.UUID) => {
    const userChannel = await UserChannel.findOne({ baseUserId: userId, channelId }, 'messageOffset');
    return Message.countDocuments({ channelId, sentOn: { $gt: userChannel?.messageOffset } });
};

const ackMessage = async (userId: Types.UUID, channelId: Types.UUID) => {
    return UserChannel.updateOne(
        { baseUserId: userId, channelId, messageOffset: { $lt: new Date() } },
        { messageOffset: new Date() }
    );
};

const listMessages = async (channelId: Types.UUID, limit: number, offset: number) => {
    return Message.find({ channelId }, 'id content sentOn attachments')
        .populate('fromBaseUserId', 'id firstName lastName email')
        .limit(limit)
        .skip(offset)
        .sort('-sentOn');
};

const listNotifications = async (baseUserId: Types.UUID, type: string, limit: number, offset: number) => {
    return Notification.find({
        $or: [
            { baseUserId },
            { broadcastTo: type },
            { broadcastTo: 'all' }
        ]
    }, 'id content sentOn link').limit(limit).skip(offset).sort('-id');
};

const getNotificationUnreadCount = async (baseUserId: Types.UUID, type: string) => {
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

const updateAttachmentUploadSuccess = async (attachmentIds: Types.UUID[], session: ClientSession) => {
    return Attachment.updateMany({ _id: { $in: attachmentIds } }, { isUploading: false, isUploaded: true, hasUploadFailed: false }).session(session);
};

const updateAttachmentUploadFailure = async (attachmentIds: Types.UUID[], session: ClientSession) => {
    return Attachment.updateMany({ _id: { $in: attachmentIds } }, { isUploading: false, isUploaded: false, hasUploadFailed: true }).session(session);
};

export {
    createChannel,
    createUserChannels,
    createMessage,
    listUsers,
    updateMessageOffset,
    getChannelByName,
    listNotifications,
    getNotificationUnreadCount,
    ackMessage,
    listMessages,
    createAttachment,
    getAttachment,
    updateAttachmentUploadSuccess,
    updateAttachmentUploadFailure,
    getUnreadMessageCount,
    getBaseUser
};
