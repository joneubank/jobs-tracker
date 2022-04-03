import * as express from 'express';

const router = express.Router() as express.Router;

const version = process.env.SERVICE_VERSION || process.env.npm_package_version;
const commit = process.env.SERVICE_COMMIT ? ` - ${process.env.SERVICE_COMMIT}` : '';

const startTime = Date.now();

router.get('/', (req, res) => {
  const resBody = {
    version: `${version} - ${process.env.SVC_COMMIT_ID}`,
  };
  return res.json(resBody);
});

router.get('/status', (req, res) => {
  const resBody = {
    connections: {},
    start: startTime,
    uptime: Date.now() - startTime,
    version: `${version}${commit}`,
  };
  return res.json(resBody);
});

export default router;
