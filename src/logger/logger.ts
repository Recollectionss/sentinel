import {LoggerAbstract} from "../core/logger.abstract";

export class Logger extends LoggerAbstract {
    log(message: string) {
        console.log(`[INFO] ${message}`);
    }

    error(error: Error, context?: string) {
        console.error(`[ERROR] [${context}]`, error);
    }
}
