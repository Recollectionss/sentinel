import {LoggerAbstract} from "./logger.abstract";

export abstract class DaemonAbstract {
    protected constructor(protected readonly logger: LoggerAbstract) {}

    protected abstract init(): Promise<void>;

    async start() {
        try {
            await this.init();
        } catch (err) {
            this.logger.error(err as Error, this.constructor.name);
        }
    }
}