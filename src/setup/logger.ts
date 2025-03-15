import winston from "winston";
import winstonRotate from "winston-daily-rotate-file";
import { LOG_LEVEL } from "./secrets";
import { Logger } from "../interfaces/logger";

export class FileLogger implements Logger {
    private appLogger: winston.Logger;
    private static logger: FileLogger | null = null;

    private constructor() {
        this.appLogger = this.createLoggerInstance('app', 'app');
    }

    static getInstance(): FileLogger {
        if (!this.logger) {
            this.logger = new FileLogger();
        }

        return this.logger;
    }

    private createLoggerInstance = (filename: string, level: string) => {
        return winston.createLogger({
            levels: {
                app: 0,
                cron: 1,
                drfirst: 2
            },
            format: winston.format.combine(
                winston.format.printf(info => {
                    return `${new Date().toISOString()}: ${info.message}`;
                })),
            transports: [
                new winston.transports.Console({ level: level, }),
                new winstonRotate({
                    filename: `logs/${filename}-%DATE%.log`,
                    zippedArchive: true,
                    maxFiles: '365d',
                    maxSize: '1g',
                    level: level
                })
            ]
        });
    };

    info = (message: any) => {
        if (LOG_LEVEL === 'info') {
            this.appLogger.log('app', `INFO: ${JSON.stringify(message.toString())}`);
        } else {
            console.error(message);
        }
    }

    debug = (message: any) => {
        if (LOG_LEVEL === 'debug') {
            this.appLogger.log('app', `DEBUG: ${JSON.stringify(message.toString())}`);
        } else {
            console.log(message);
        }
    }

    error = (message: any) => {
        if (LOG_LEVEL === 'error' || LOG_LEVEL === 'debug') {
            this.appLogger.log('app', `ERROR: ${JSON.stringify(message.toString())}`);
        } else {
            console.error(message);
        }
    }
}