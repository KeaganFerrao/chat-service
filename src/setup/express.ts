import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import { FRONTEND_URL } from './secrets';

const app: Application = express();

app.use(express.json());
app.use(cors({
    origin: [FRONTEND_URL!, 'http://localhost:3000', 'http://localhost:4173', 'https://localhost:5173', 'https://localhost:4173'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(compression());

export default app;
