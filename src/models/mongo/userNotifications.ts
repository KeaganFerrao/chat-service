import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.UUID,
        default: () => new mongoose.Types.UUID() // Using UUID instead of MongoDB's default ObjectId
    },
    baseUserId: {
        type: mongoose.Types.UUID,
        ref: 'BaseUser',
        required: true
    },
    notificationOffset: {
        type: Date,
        required: true
    }
}, {
    collection: 'userNotifications',
    timestamps: false
});

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

export default UserNotification;
