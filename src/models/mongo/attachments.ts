import mongoose from 'mongoose';

// Define the schema
const attachmentsSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.UUID,
        default: () => new mongoose.Types.UUID(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    baseUserId: {
        type: String, // UUID as a string
        required: true,
        ref: 'BaseUser' // Reference to BaseUser collection
    },
    channelId: {
        type: String, // UUID as a string
        required: true,
        ref: 'Channel' // Reference to Channels collection
    },
    fileName: {
        type: String,
        required: true,
        maxlength: 100
    },
    isUploaded: {
        type: Boolean,
        default: false
    },
    isUploading: {
        type: Boolean,
        default: false
    },
    hasUploadFailed: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'attachments', // Explicitly setting the collection name
    timestamps: false // No createdAt/updatedAt fields
});

// Create the model
const Attachments = mongoose.model('Attachments', attachmentsSchema);

export default Attachments;
