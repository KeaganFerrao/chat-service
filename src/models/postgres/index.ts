import baseUser from "./baseUser";
import channel from "./channel";
import message from "./message";
import userChannel from "./userChannel";
import attachments from "./attachments";
import notifications from "./notifications";
import userNotification from "./userNotifications";

channel.hasMany(message, {
    foreignKey: 'channelId',
});
message.belongsTo(channel, {
    foreignKey: 'channelId',
});
message.belongsTo(baseUser, {
    foreignKey: 'fromBaseUserId',
});
notifications.belongsTo(baseUser, {
    foreignKey: 'baseUserId',
});
baseUser.hasMany(notifications, {
    foreignKey: 'baseUserId',
});
userChannel.belongsTo(channel, {
    foreignKey: 'channelId',
});
userChannel.belongsTo(baseUser, {
    foreignKey: 'baseUserId',
});
userChannel.hasMany(message, {
    foreignKey: 'channelId',
});
baseUser.hasMany(attachments, {
    foreignKey: 'baseUserId',
});
userChannel.belongsTo(baseUser, {
    foreignKey: 'toBaseUserId',
    as: 'toUser',
});

export {
    channel,
    message,
    userChannel,
    attachments,
    notifications,
    userNotification,
    baseUser
}