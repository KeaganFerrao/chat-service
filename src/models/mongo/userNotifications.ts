import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => new mongoose.Types.UUID().toString() // Using UUID instead of MongoDB's default ObjectId
    },
    baseUserId: {
        type: String,
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
