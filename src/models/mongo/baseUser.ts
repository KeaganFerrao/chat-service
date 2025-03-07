import mongoose from 'mongoose';

const baseUserSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.UUID,
        default: () => new mongoose.Types.UUID(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        required: true
    },
    firstName: {
        type: String,
        required: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        maxlength: 50,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'baseUsers',
    timestamps: false
});

const BaseUser = mongoose.model('BaseUser', baseUserSchema);

export default BaseUser;
