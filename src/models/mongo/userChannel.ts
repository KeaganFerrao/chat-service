import mongoose from 'mongoose';

const userChannelSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => new mongoose.Types.UUID().toString(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    baseUserId: {
        type: String,
        ref: 'BaseUser', // Reference to BaseUser collection
        required: true
    },
    toBaseUserId: {
        type: String,
        ref: 'BaseUser',
        default: null
    },
    channelId: {
        type: String,
        ref: 'Channel', // Reference to Channel collection
        required: true
    },
    messageOffset: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'userChannels',
    timestamps: false,
    _id: false
});

const UserChannel = mongoose.model('UserChannel', userChannelSchema);

export default UserChannel;
