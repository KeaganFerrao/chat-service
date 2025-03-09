import sequelize from "@setup/database";
import { Transaction } from "sequelize";
import { TransactionManager } from "../interfaces/messages";

export class SequelizeTransactionManager implements TransactionManager {
    startTransaction = async (): Promise<Transaction> => {
        const transaction = await sequelize.transaction();
        return transaction;
    }

    commitTransaction = async (transaction: Transaction): Promise<void> => {
        await transaction.commit();
    }

    rollbackTransaction = async (transaction: Transaction): Promise<void> => {
        await transaction.rollback();
    }
}