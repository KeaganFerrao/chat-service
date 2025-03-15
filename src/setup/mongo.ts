import mongoose from 'mongoose';
import { MONGO_URI } from './secrets';
import { FileLogger } from './logger';

const logger = FileLogger.getInstance();

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI!);
        logger.debug('MongoDB Connected');
    } catch (error) {
        logger.error('MongoDB Connection Error');
        logger.error(error);
    }
};