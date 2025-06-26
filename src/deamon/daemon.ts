import {DaemonAbstract} from "../core/daemon.abstract";
import {LoggerAbstract} from "../core/logger.abstract";

export class Daemon extends DaemonAbstract{
    constructor(logger: LoggerAbstract) {
        super(logger);
    }

    protected async init(): Promise<void> {
       this.logger.log('Initializing...');
    }
}