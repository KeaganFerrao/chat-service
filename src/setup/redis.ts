import { Redis } from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./secrets";
import { io } from "../index";
import { ConsoleLogger } from "./consoleLogger";

const logger = new ConsoleLogger();

export const connectRedis = async () => {
    try {
        const pubClient = new Redis({
            host: REDIS_HOST,
            port: Number(REDIS_PORT),
            password: REDIS_PASSWORD,
            retryStrategy(times) {
                logger.debug(`Connection attempt ${times}`);
                return 30000;
            },
        });
        const subClient = pubClient.duplicate();

        pubClient.on('error', (error) => {
            logger.error("Redis pubclient error");
            logger.error(error);
        })
        subClient.on('error', (error) => {
            logger.error("Redis subclient error");
            logger.error(error);
        })

        pubClient.on('connect', () => {
            logger.debug("Redis pubclient connected");
        })
        subClient.on('connect', () => {
            logger.debug("Redis subclient connected");
        })

        pubClient.on('close', () => {
            logger.error("Redis pubclient connection closed");
        })
        subClient.on('close', () => {
            logger.error("Redis subclient connection closed");
        })
    
        io.adapter(createAdapter(pubClient, subClient));

        logger.debug("Redis adapter attached");
    } catch (error) {
        logger.error("Error while connecting to redis");
        logger.error(error);
    }
}