import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.UUID,
        default: () => new mongoose.Types.UUID(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    baseUserId: {
        type: mongoose.Types.UUID,
        default: null
    },
    content: {
        type: String,
        default: null
    },
    broadcastTo: {
        type: String,
        enum: ['admin', 'user', 'all'],
        default: null
    },
    link: {
        type: String,
        default: null
    },
    sentOn: {
        type: Date,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'notifications',
    timestamps: false
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
