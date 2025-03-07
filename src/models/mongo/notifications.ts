import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    id: {
        type: Number, // BIGINT equivalent in MongoDB
        unique: true,
        required: true
    },
    baseUserId: {
        type: String,
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
