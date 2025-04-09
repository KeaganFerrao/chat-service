import mongoose from 'mongoose';
import { DB_TYPE, MONGO_URI } from './secrets';
import { ConsoleLogger } from './consoleLogger';

const logger = new ConsoleLogger();

export const connectMongoDB = async () => {
    try {
        if (DB_TYPE !== 'mongo') {
            return;
        }

        await mongoose.connect(MONGO_URI!);
        logger.debug('MongoDB Connected');
    } catch (error) {
        logger.error('MongoDB Connection Error');
        logger.error(error);
    }
};