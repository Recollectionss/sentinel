export abstract class LoggerAbstract {
    abstract log(message: string): void;
    abstract error(error: Error, context?: string): void;
}
