import { Logger } from "../interfaces/logger";

export class ConsoleLogger implements Logger {
    debug(message: any): void {
        console.log(message)
    }
    error(message: any): void {
        console.error(message);
    }
    info(message: any): void {
        console.info(message)
    }
}