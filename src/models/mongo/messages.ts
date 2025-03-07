import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // UUID generator

const messageSchema = new mongoose.Schema({
    id: {
        type: String, // Store UUID as a string
        default: uuidv4, // Generate UUID on creation
        unique: true
    },
    fromBaseUserId: {
        type: String, // Assuming this is an integer in Sequelize
        required: true
    },
    channelId: {
        type: String, // UUID stored as string
        required: true
    },
    content: {
        type: String,
        default: null
    },
    attachments: {
        type: Object, // JSONB equivalent
        default: null
    },
    sentOn: {
        type: Date,
        required: true
    }
}, {
    collection: 'messages',
    timestamps: false
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
