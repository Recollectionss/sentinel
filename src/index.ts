import {Daemon} from "./deamon/daemon";
import {Logger} from "./logger/logger";
new Daemon(
    new Logger()
).start();