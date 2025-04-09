import 'module-alias/register';
import { ErrorMiddleware } from "./middleware/error";
import app from "./setup/express";
import { PORT } from "./setup/secrets";
import { createServer } from 'http';
import router from './routes'
import setUpSocket from './setup/socket';
import { connectMongoDB } from '@setup/mongo';
import { connectRedis } from '@setup/redis';
import { ConsoleLogger } from '@setup/consoleLogger';

const logger = new ConsoleLogger();
const errorMiddleware = new ErrorMiddleware(logger);

const server = createServer(app);

app.use('/api/v1', router);
app.use(errorMiddleware.errorHandler);
app.use(errorMiddleware.notFoundHandler);

connectMongoDB();

export const io = setUpSocket(server);

connectRedis();

server.listen(PORT || 8080, () => {
    logger.debug(`Server started on port ${PORT || 8080}`)
})