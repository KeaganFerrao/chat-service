import { Server as httpServer } from "http";
import { Server } from "socket.io";
import { FRONTEND_URL } from "./secrets";
import logger from "./logger";
import { JwtPayload } from "jsonwebtoken";
import { decodeToken } from "@utility/auth";
import { AckMessage, AckNotification, DownloadAttachment, GetNotificationUnreadCount, ListChannels, ListMessages, ListNotifications, ListUsers, ReachUser, SendMessage } from "@controllers/socket";
import { getBaseUser } from "@models/helpers/messages";

const setUpSocket = (server: httpServer) => {
    const io = new Server(server, {
        cors: {
            origin: [FRONTEND_URL!, 'http://localhost:5173', 'http://localhost:4173', 'https://localhost:5173', 'https://localhost:4173', 'http://127.0.0.1:5500'],
            credentials: true,
        }
    });

    io.use(async (socket, next) => {
        try {
            logger.debug('Validating incoming socket connection');

            const headers = socket.handshake.headers;
            const bearerToken = headers?.authorization;
            if (!bearerToken) {
                logger.debug('Missing token in socket cookie');
                return next(new Error("Missing token"));
            }

            const token = bearerToken?.split(' ')?.[1];
            if (!token) {
                logger.debug('Missing token in socket cookie');
                return next(new Error("Missing token"));
            }

            let decodedToken: JwtPayload;
            try {
                decodedToken = await decodeToken(token);
            } catch (error) {
                logger.debug('Invalid token in socket cookie');
                return next(new Error("Invalid token"));
            }

            const user = await getBaseUser(decodedToken.id);
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

            socket.on('message:send', SendMessage(socket));
            socket.on('message:list', ListMessages(socket));
            socket.on('message:ack', AckMessage(socket));
            socket.on('message:attachment:download', DownloadAttachment(socket));

            socket.on('user:list', ListUsers(socket));
            socket.on('user:reach', ReachUser(socket));
            socket.on('channel:list', ListChannels(socket));

            socket.on('notification:list', ListNotifications(socket));
            socket.on('notification:unreadcount', GetNotificationUnreadCount(socket));
            socket.on('notification:ack', AckNotification(socket));

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