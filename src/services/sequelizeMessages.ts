import { MessageService } from "../interfaces/messages";
import { literal, Op, Transaction } from "sequelize"
import { attachments, baseUser, channel, message, notifications, userChannel, userNotification } from "../models/postgres/index";

export class SequelizeMessageService implements MessageService {
    getBaseUser = async (baseUserId: string, transaction?: Transaction) => {
        const userData = await baseUser.findOne({
            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
            where: {
                id: baseUserId,
                isDeleted: false
            },
            ...transaction && { transaction }
        });
        return userData;
    }

    createChannel = async (name: string, type: 'private', transaction: Transaction) => {
        const created = await channel.create({
            name,
            type
        }, {
            transaction
        })

        return created
    }

    getChannelByName = async (name: string, transaction: Transaction) => {
        const channelData = await channel.findOne({
            attributes: ['id'],
            where: {
                name
            },
            transaction
        })

        return channelData
    }

    createUserChannels = async (data: { baseUserId: string, toBaseUserId: string, channelId: string }[], transaction: Transaction) => {
        await userChannel.bulkCreate(data, {
            transaction
        })
    }

    listUsers = async (userId: string, limit: number, offset: number, search: string | undefined) => {
        const users = await baseUser.findAndCountAll({
            attributes: ['id', 'firstName', 'lastName', 'role'],
            where: {
                isDeleted: false,
                id: {
                    [Op.ne]: userId
                },
                ...(search && {
                    [Op.or]: [
                        {
                            firstName: {
                                [Op.iLike]: `%${search}%`
                            }
                        },
                        {
                            lastName: {
                                [Op.iLike]: `%${search}%`
                            }
                        }
                    ]
                })
            },
            limit,
            offset,
            order: [['firstName', 'ASC']]
        })

        return users;
    }

    listUserChannels = async (userId: string, limit: number, offset: number, search?: string) => {
        const unreadCountSubquery = `
        SELECT COUNT(*)
        FROM "messages"
        WHERE "messages"."channelId" = "userChannels"."channelId"
        AND "messages"."sentOn" > "userChannels"."messageOffset"
    `;

        const lastMessageSubquery = `
        SELECT json_build_object('id', "id", 'content', "content", 'sentOn', "sentOn", 'attachments', "attachments")
        FROM "messages"
        WHERE "messages"."channelId" = "userChannels"."channelId"
        ORDER BY "sentOn" DESC
        LIMIT 1
    `;

        const list = await userChannel.findAndCountAll({
            attributes: ['channelId', [literal(`(${unreadCountSubquery})`), 'unreadMessageCount'], [literal(`(${lastMessageSubquery})`), 'lastMessage']],
            where: {
                [Op.and]: [
                    {
                        baseUserId: userId
                    },
                    literal(`EXISTS (SELECT "id"
                        FROM "messages"
                        WHERE "messages"."channelId" = "userChannels"."channelId")`),
                ]
            },
            include: [
                {
                    model: baseUser,
                    as: 'toUser',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: true,
                    where: {
                        isDeleted: false,
                        ...(search && {
                            [Op.or]: [
                                {
                                    firstName: {
                                        [Op.iLike]: `%${search}%`
                                    }
                                },
                                {
                                    lastName: {
                                        [Op.iLike]: `%${search}%`
                                    }
                                }
                            ]
                        })
                    }
                }
            ],
            limit,
            offset,
            order: [['unreadMessageCount', 'DESC']]
        })

        return list;
    }

    createMessage = async (fromBaseUserId: string, channelId: string, content: string | null | undefined, attachments: { fileName: string, id: string }[] | null, transaction: Transaction) => {
        const data = await message.create({
            fromBaseUserId,
            channelId,
            sentOn: new Date(),
            ...(content && {
                content
            }),
            ...(attachments && attachments.length && {
                attachments: JSON.stringify(attachments)
            })
        }, {
            transaction
        })

        return data;
    }

    updateMessageOffset = async (userId: string, channelId: string, transaction: Transaction) => {
        await userChannel.update({
            messageOffset: new Date()
        }, {
            where: {
                baseUserId: userId,
                channelId
            },
            transaction
        })
    }

    createAttachment = async (baseUserId: string, channelId: string, fileNames: string[], transaction: Transaction) => {
        const data = await attachments.bulkCreate(fileNames.map(fileName => ({
            baseUserId,
            channelId,
            fileName,
            isUploading: true
        })), {
            transaction
        })

        return data;
    }

    getAttachment = async (attachmentId: string, channelId: string) => {
        const attachment = await attachments.findOne({
            attributes: ['id', 'fileName', 'isUploaded', 'isUploading', 'hasUploadFailed'],
            where: {
                id: attachmentId,
                channelId
            }
        })

        return attachment;
    }

    getUsersInChannel = async (channelId: string, exceptionUserId: string, transaction: Transaction) => {
        const unreadCountSubquery = `
        SELECT COUNT(*)
        FROM "messages"
        WHERE "messages"."channelId" = "userChannels"."channelId"
        AND "messages"."sentOn" > "userChannels"."messageOffset"
    `;

        const users = await userChannel.findAll({
            attributes: ['baseUserId', [literal(`(${unreadCountSubquery})`), 'unreadMessageCount']],
            where: {
                channelId,
                baseUserId: {
                    [Op.ne]: exceptionUserId
                }
            },
            transaction
        })

        return users
    }

    getUnreadMessageCount = async (userId: string, channelId: string) => {
        const data = await userChannel.findOne({
            attributes: ['messageOffset'],
            where: {
                baseUserId: userId,
                channelId
            }
        })

        const unreadMessageCount = await message.count({
            where: {
                channelId,
                sentOn: {
                    [Op.gt]: data?.messageOffset
                }
            }
        })

        return unreadMessageCount
    }

    ackMessage = async (userId: string, channelId: string) => {
        await userChannel.update({
            messageOffset: new Date()
        }, {
            where: {
                baseUserId: userId,
                channelId,
                messageOffset: {
                    [Op.lt]: new Date()
                }
            }
        })
    }

    ackNotification = async (userId: string) => {
        await userNotification.update({
            notificationOffset: new Date()
        }, {
            where: {
                baseUserId: userId,
                notificationOffset: {
                    [Op.lt]: new Date()
                }
            }
        })
    }

    getChannel = async (channelId: string, userId: string) => {
        const channel = await userChannel.findOne({
            where: {
                baseUserId: userId,
                channelId
            }
        })

        return channel;
    }

    listMessages = async (channelId: string, limit: number, offset: number) => {
        const list = await message.findAndCountAll({
            attributes: ['id', 'content', 'sentOn', 'attachments'],
            where: {
                channelId
            },
            include: [
                {
                    model: baseUser,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            limit,
            offset,
            order: [['sentOn', 'DESC']]
        })

        return list;
    }

    listNotifications = async (baseUserId: string, type: 'admin' | 'staff' | 'doctor' | 'patient', limit: number, offset: number) => {
        const list = await notifications.findAndCountAll({
            attributes: ['id', 'content', 'sentOn', 'link'],
            where: {
                [Op.or]: [
                    {
                        baseUserId: baseUserId
                    },
                    {
                        broadcastTo: type
                    },
                    {
                        broadcastTo: 'all'
                    }
                ],
            },
            limit,
            offset,
            order: [['id', 'DESC']]
        })

        return list;
    }

    getNotificationUnreadCount = async (baseUserId: string, type: 'admin' | 'user') => {
        const data = await userNotification.findOne({
            attributes: ['notificationOffset'],
            where: {
                baseUserId
            }
        })

        const unreadNotificationCount = await notifications.count({
            where: {
                sentOn: {
                    [Op.gt]: data?.notificationOffset
                },
                [Op.or]: [
                    {
                        baseUserId: baseUserId
                    },
                    {
                        broadcastTo: type
                    },
                    {
                        broadcastTo: 'all'
                    }
                ],
            }
        })

        return unreadNotificationCount
    }

    getAttachmentById = async (attachmentId: string, baseUserId: string, transaction: Transaction) => {
        const attachment = await attachments.findOne({
            attributes: ['id'],
            where: {
                id: attachmentId,
                baseUserId
            },
            transaction
        })

        return attachment;
    }

    updateAttachmentUploadSuccess = async (attachmentIds: string[], transaction: Transaction) => {
        await attachments.update({
            isUploading: false,
            isUploaded: true,
            hasUploadFailed: false
        }, {
            where: {
                id: {
                    [Op.in]: attachmentIds
                }
            },
            transaction
        })
    }

    updateAttachmentUploadFailure = async (attachmentIds: string[], transaction: Transaction) => {
        await attachments.update({
            isUploading: false,
            isUploaded: false,
            hasUploadFailed: true
        }, {
            where: {
                id: {
                    [Op.in]: attachmentIds
                }
            },
            transaction
        })
    }
}