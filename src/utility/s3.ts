import { FileSystemUtils } from "../interfaces/filesystem";
import { Upload } from "@aws-sdk/lib-storage";
import { AWS_BUCKET_NAME, S3_UPLOAD_TIMEOUT_MS } from "../setup/secrets";
import { PassThrough } from "stream";
import s3Client from "../setup/s3";
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class AwsS3FileSystemUtils implements FileSystemUtils {
    upload = async (file: Buffer, name: string, contentType: string) => {
        const s3Stream = new PassThrough();

        s3Stream.end(file);

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: AWS_BUCKET_NAME,
                Key: name,
                Body: s3Stream,
                ContentType: contentType
            }
        });

        const timerId = setTimeout(async () => {
            console.error(`Upload to S3 timed out after ${S3_UPLOAD_TIMEOUT_MS} ms. Aborting upload.`);
            await upload.abort();
            console.error(`Upload aborted.`);
        }, S3_UPLOAD_TIMEOUT_MS ? Number(S3_UPLOAD_TIMEOUT_MS) : 60000);

        const uploadedFile = await upload.done();
        clearTimeout(timerId);

        return uploadedFile.Location;
    };

    delete = async (name: string) => {
        const command = new DeleteObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: name
        })

        await s3Client.send(command);
    }

    generateUrl = async (name: string, expiresIn: number) => {
        const command = new GetObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: name
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return url;
    }
}