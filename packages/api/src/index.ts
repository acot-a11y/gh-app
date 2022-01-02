import { createServer } from './server';
import { createLogger } from './logging';
import { PORT, SHUTDOWN_TIMEOUT } from './constants';
import { createDriverRegistry } from './drivers/registry';

(async () => {
  const logger = createLogger();
  const server = await createServer(createDriverRegistry());

  /**
   * Bootstrap
   */
  server.listen(PORT, '0.0.0.0', (err, address) => {
    if (err) {
      logger.error(err, 'failed bootstrap');
      process.exit(1);
    }
    logger.info(`listening on ${address}`);
  });

  /**
   * Error handling
   */
  process.on('uncaughtException', (err) => {
    logger.error(err, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, p) => {
    logger.error({ reason, err: p }, 'Unhandled rejection');
    process.exit(1);
  });

  /**
   * Graceful shutdown
   */
  const shutdown = (message: string, error?: Error | unknown) => {
    let code = 0;

    if (error != null) {
      code = 1;
      logger.error(error, message);
    } else {
      logger.info(message);
    }

    process.exit(code);
  };

  process.once('SIGTERM', async () => {
    logger.info('receive sigterm signal');

    const message = 'process terminated';

    try {
      await Promise.race([
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Graceful shutdown timeout')),
            SHUTDOWN_TIMEOUT,
          ),
        ),
        server.close(),
      ]);

      shutdown(message);
    } catch (e) {
      shutdown('terminate process after timeout', e);
    }
  });
})();
