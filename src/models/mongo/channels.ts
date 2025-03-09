import mongoose from 'mongoose';

// Define the schema
const channelSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => new mongoose.Types.UUID().toString(), // Using UUID instead of MongoDB's ObjectId
        unique: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ['private'], // Restrict values to match ENUM in Sequelize
        required: true
    }
}, {
    collection: 'channels', // Explicitly setting the collection name
    timestamps: false // No createdAt/updatedAt fields
});

// Create the model
const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
