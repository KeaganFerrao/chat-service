import mongoose from 'mongoose';
import { MONGO_URI } from './secrets';
import logger from './logger';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI!);
        logger.debug('MongoDB Connected');
    } catch (error) {
        logger.error('MongoDB Connection Error');
        logger.error(error);
    }
};