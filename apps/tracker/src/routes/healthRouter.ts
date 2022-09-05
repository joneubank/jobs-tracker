import * as express from 'express';
import { getConnectionStatus } from '../services/healthService';
import { connectionStatus as mongoConnection } from '../external/mongo';
import { ServiceStatus } from '../external/types';

const router = express.Router() as express.Router;

const version = process.env.SERVICE_VERSION || process.env.npm_package_version;
const commit = process.env.SERVICE_COMMIT ? ` - ${process.env.SERVICE_COMMIT}` : '';

const startTime = Date.now();

router.get('/', (req, res) => {
  const resBody = {
    version: `${version}${commit}`,
  };
  return res.json(resBody);
});

router.get('/status', async (req, res) => {
  const resBody = {
    connections: await getConnectionStatus(),
    start: startTime,
    uptime: Date.now() - startTime,
    version: `${version}${commit}`,
  };

  const status = mongoConnection === ServiceStatus.Connected ? 200 : 500;
  return res.status(status).json(resBody);
});

export default router;
