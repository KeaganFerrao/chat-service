import 'module-alias/register';
import { ErrorMiddleware } from "./middleware/error";
import app from "./setup/express";
import { FileLogger } from "./setup/logger";
import { PORT } from "./setup/secrets";
import { createServer } from 'http';
import router from './routes'
import setUpSocket from './setup/socket';
import { connectDB } from '@setup/mongo';

const fileLogger = FileLogger.getInstance();
const errorMiddleware = new ErrorMiddleware(fileLogger);

const server = createServer(app);

app.use('/api/v1', router);
app.use(errorMiddleware.errorHandler);
app.use(errorMiddleware.notFoundHandler);

connectDB();

export const io = setUpSocket(server);

server.listen(PORT || 8080, () => {
    fileLogger.debug(`Server started on port ${PORT || 8080}`)
})