import mongoose, { ClientSession } from "mongoose";
import { TransactionManager } from "../interfaces/messages";

export class MongoTransactionManager implements TransactionManager {
    startTransaction = async (): Promise<ClientSession> => {
        const session = await mongoose.startSession();
        await session.startTransaction();

        return session;
    }

    commitTransaction = async (transaction: ClientSession): Promise<void> => {
        await transaction.commitTransaction();
        await transaction.endSession();
    }

    rollbackTransaction = async (transaction: ClientSession): Promise<void> => {
        await transaction.abortTransaction();
        await transaction.endSession();
    }

}