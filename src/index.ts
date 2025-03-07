import 'module-alias/register';
import { errorHandler, notFoundHandler } from "./middleware/error";
import app from "./setup/express";
import logger from "./setup/logger";
import { PORT } from "./setup/secrets";
import { createServer } from 'http';
import router from './routes'
import setUpSocket from './setup/socket';

const server = createServer(app);

app.use('/api/v1', router);
app.use(errorHandler);
app.use(notFoundHandler);

export const io = setUpSocket(server);

server.listen(PORT || 8080, () => {
    logger.debug(`Server started on port ${PORT || 8080}`)
})