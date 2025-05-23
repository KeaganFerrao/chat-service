import { Server as httpServer } from "http";
import { Server } from "socket.io";
import { DB_TYPE, FRONTEND_URL } from "./secrets";
import { SocketController } from "@controllers/socket";
import { MessageService, TransactionManager } from "../interfaces/messages";
import { MongoMessageService } from "../services/mongoMessages";
import { SequelizeMessageService } from "../services/sequelizeMessages";
import { MongoTransactionManager } from "@utility/mongoTransactionManager";
import { SequelizeTransactionManager } from "@utility/sequelizeTransactionManager";
import { AwsS3FileSystemUtils } from "@utility/s3";
import { JwtAuthService } from "@utility/auth";
import { ConsoleLogger } from "./consoleLogger";

let messageService: MessageService;
let transactionManager: TransactionManager;
if (DB_TYPE == 'mongo') {
    messageService = new MongoMessageService();
    transactionManager = new MongoTransactionManager();
} else {
    messageService = new SequelizeMessageService();
    transactionManager = new SequelizeTransactionManager();
}

const logger = new ConsoleLogger();
const fileSystemUtils = new AwsS3FileSystemUtils();
const authService = new JwtAuthService();

const socketController = new SocketController(messageService, transactionManager, fileSystemUtils, logger);

const setUpSocket = (server: httpServer) => {
    const io = new Server(server, {
        cors: {
            origin: [FRONTEND_URL!, 'http://localhost:3000', 'http://localhost:4173', 'https://localhost:5173', 'https://localhost:4173', 'http://127.0.0.1:5500']
        }
    });

    io.use(async (socket, next) => {
        try {
            logger.debug('Validating incoming socket connection');

            const headers = socket.handshake.headers;

            const token = authService.extractToken(headers);
            if (!token) {
                logger.debug('Missing token in socket');
                return next(new Error("Missing token"));
            }

            let decodedToken: Record<string, any>;
            try {
                decodedToken = await authService.verifyToken(token);
            } catch (error) {
                logger.debug('Invalid token in socket');
                return next(new Error("Invalid token"));
            }

            const user = await messageService.getBaseUser(decodedToken.payload.id);
            if (!user) {
                logger.debug('Invalid user for socket connection');
                return next(new Error("Invalid user"));
            }

            socket.data.payload = {
                baseUserId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                type: user.role,
            }
            next();
        } catch (error) {
            logger.error(error);
            next(new Error("Internal server error"));
        }
    })

    io.on('connection', async (socket) => {
        try {
            logger.debug('User connected to socket');

            let payload = socket.data.payload;
            logger.debug(payload);

            socket.join(`user:${payload.baseUserId}`);
            socket.join(`role:${payload.type}`);

            socket.on('message:send', socketController.SendMessage(socket));
            socket.on('message:list', socketController.ListMessages(socket));
            socket.on('message:ack', socketController.AckMessage(socket));
            socket.on('message:attachment:download', socketController.DownloadAttachment(socket));

            socket.on('user:list', socketController.ListUsers(socket));
            socket.on('user:reach', socketController.ReachUser(socket));
            socket.on('channel:list', socketController.ListChannels(socket));

            socket.on('notification:list', socketController.ListNotifications(socket));
            socket.on('notification:unreadcount', socketController.GetNotificationUnreadCount(socket));
            socket.on('notification:ack', socketController.AckNotification(socket));

            socket.on('disconnect', () => {
                logger.debug('User disconnected from socket');
                logger.debug(payload);
            });
        } catch (error) {
            logger.error('Error in socket connection');
            logger.error(error);
        }
    });

    return io;
}

export default setUpSocket;