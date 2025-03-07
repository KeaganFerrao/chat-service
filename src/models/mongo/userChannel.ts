import mongoose from 'mongoose';

const userChannelSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.UUID,
        default: () => new mongoose.Types.UUID(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    baseUserId: {
        type: mongoose.Types.UUID,
        ref: 'BaseUser', // Reference to BaseUser collection
        required: true
    },
    toBaseUserId: {
        type: mongoose.Types.UUID,
        ref: 'BaseUser',
        default: null
    },
    channelId: {
        type: mongoose.Types.UUID,
        ref: 'Channel', // Reference to Channel collection
        required: true
    },
    messageOffset: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'userChannels',
    timestamps: false
});

const UserChannel = mongoose.model('UserChannel', userChannelSchema);

export default UserChannel;
