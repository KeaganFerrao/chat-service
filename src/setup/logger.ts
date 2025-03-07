import winston from "winston";
import winstonRotate from "winston-daily-rotate-file";
import { LOG_LEVEL } from "./secrets";

const createLoggerInstance = (filename: string, level: string) => {
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

const cronLogger = createLoggerInstance('cron', 'cron');
const appLogger = createLoggerInstance('app', 'app');
const drfirstLogger = createLoggerInstance('drfirst', 'drfirst');

const cron = (message: any, level: 'DEBUG' | 'ERROR') => {
    cronLogger.log('cron', `${level}: ${JSON.stringify(message.toString())}`);
}

const debug = (message: any) => {
    if (LOG_LEVEL === 'debug') {
        appLogger.log('app', `DEBUG: ${JSON.stringify(message.toString())}`);
    } else {
        console.log(message);
    }
}

const error = (message: any) => {
    if (LOG_LEVEL === 'error' || LOG_LEVEL === 'debug') {
        appLogger.log('app', `ERROR: ${JSON.stringify(message.toString())}`);
    } else {
        console.error(message);
    }
}

const drfirst = (message: any) => {
    drfirstLogger.log('drfirst', `${JSON.stringify(message.toString())}`);
}

export default {
    cron,
    debug,
    error,
    drfirst
}