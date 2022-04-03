import * as kafka from './external/kafka';
import * as server from './server';
import * as elasticsearch from './external/elasticsearch';
import Logger from 'logger';
import config from './config';
const logger = Logger('Index');

(async () => {
  // Test ES Connection
  logger.info('  =====  ');
  logger.info('Initialize Elasticsearch Connection:');
  await elasticsearch.getClient();

  // Connect to Kafka
  if (config.features.enableKafka) {
    logger.info('  =====  ');
    logger.info('Initialize Kafka:');
    await kafka.setup();
  }

  // Start Express Server
  logger.info('  =====  ');
  logger.info('Intitialize Express Server:');
  await server.start();
})();

// terminate kafka connections before exiting
// https://kafka.js.org/docs/producer-example
const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map((type) => {
  process.on(type as any, async (e: Error) => {
    try {
      logger.info(`process.on ${type}`);
      logger.error(e.message);
      console.log(e); // Get full error output
      await kafka.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.map((type) => {
  process.once(type as any, async () => {
    try {
      await kafka.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
