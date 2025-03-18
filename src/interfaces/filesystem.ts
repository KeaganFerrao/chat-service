export interface FileSystemUtils {
    upload(file: Buffer, name: string, contentType: string): Promise<string | undefined>;
    delete(name: string): Promise<void>;
    generateUrl(name: string, expiresIn: number): Promise<string>
}