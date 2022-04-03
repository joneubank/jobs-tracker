import express from 'express';
import healthRouter from './routes/healthRouter';
import testRouter from './routes/testRouter';
import config from './config';
import Logger from 'logger';
const logger = Logger('Server');

let server: express.Express;

export async function start(): Promise<express.Express> {
  server = express();
  server.use(express.json());

  server.use('/', healthRouter);
  if (config.features.enableTestRoutes) {
    server.use('/test', testRouter);
  }

  await server.listen(config.server.port);

  logger.info(`Listening on port ${config.server.port}`);

  return server;
}
