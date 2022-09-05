import * as express from 'express';
import config from '../config';
import parseJobUpdateEvent from '../external/kafka/consumers/eventParsers/parseJobUpdateEvent';
import Logger from 'logger';
import { getJobId, isJobEvent, isJobDefinition } from 'data-model';
import * as eventService from '../services/eventService';
import * as dbService from '../services/dbService';
import wrapAsync from '../utils/wrapAsync';
const logger = Logger('Route.Test');

const router = express.Router() as express.Router; // TSC complaining about types without the explicit type aliasing

router.use((_req, res, next) => {
  if (config.features.enableTestRoutes) {
    next();
  } else {
    res.status(404).send();
  }
});

/**
 * Send Job Event to server
 */
router.post(
  '/event',
  wrapAsync(async (req, res) => {
    const body = req.body;
    logger.debug(req.method, req.url, body);
    const event = parseJobUpdateEvent(body);
    if (!isJobEvent(event)) {
      res.status(400).json({ message: `Invalid event provided` });
    } else {
      const job = await eventService.handleUpdateEvent(event);
      res.json(job);
    }
  }),
);

router.get(
  '/job/:service/:name/:id',
  wrapAsync(async (req, res) => {
    const jobDefinition = req.params;
    if (!isJobDefinition(jobDefinition)) {
      res.status(400).json({ message: `Invalid input parameters` });
    } else {
      const jobResult = await dbService.getJob(jobDefinition);
      if (jobResult.ok) {
        res.json(jobResult.value);
      } else {
        res.status(404).json({ message: `No Job found with ID: ${getJobId(jobDefinition)}` });
      }
    }
  }),
);

// router.get(
//   '/job/:service',
//   wrapAsync(async (req, res) => {

//   }),
// );

export default router;
