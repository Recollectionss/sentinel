import { Daemon } from './deamon/daemon';

async function bootstrap(): Promise<void> {
  const daemon = new Daemon();
  await daemon.start();
  await daemon.upWatcher();
}

bootstrap();
