import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => new mongoose.Types.UUID().toString(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    fromBaseUserId: {
        type: String, // Assuming this is an integer in Sequelize
        required: true
    },
    channelId: {
        type: String,
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
