import { Daemon } from './deamon/daemon';

async function bootstrap() {
  const daemon = new Daemon();

  await daemon.start();
  await daemon.upWatcher();

  process.on('SIGTERM', async () => {
    await daemon.downWatcher();
    process.exit(0);
  });
}

bootstrap();
