import { config } from "dotenv";
config({
    path: '../.env'
});

export const {
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_MAX_CONNECTIONS_POOL,
    DB_MIN_CONNECTIONS_POOL,
    DB_ACCQUIRE_TIME,
    DB_IDLE_TIME,
    JWT_SECRET,
    FRONTEND_URL,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
    S3_UPLOAD_TIMEOUT_MS,
    LOG_LEVEL,
    MONGO_URI,
    DB_TYPE
} = process.env;