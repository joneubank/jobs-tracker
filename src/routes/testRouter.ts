import { Router } from 'express';
import config from '../config';
import parseJobUpdateEvent from '../external/kafka/consumers/eventParsers/parseJobUpdateEvent';
import Logger from '../logger';
import { isJobEvent } from '../model/events/validators';
import { isJobDefinition } from '../model/jobs/validators';
import * as jobService from '../services/jobService';
import wrapAsync from '../utils/wrapAsync';
const logger = Logger('Route.Test');

const router = Router();

router.use((_req, res, next) => {
  if (config.features.enableTestRoutes) {
    next();
  } else {
    res.status(404).send();
  }
});

router.post(
  '/event',
  wrapAsync(async (req, res) => {
    const body = req.body;
    logger.debug(req.method, req.url, body);
    const event = parseJobUpdateEvent(body);
    if (!isJobEvent(event)) {
      res.status(400).json({ message: `Invalid event provided` });
    } else {
      const job = await jobService.updateJob(event);
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
      const maybeJob = await jobService.fetchJob(jobDefinition);
      if (maybeJob) {
        res.json(maybeJob);
      }
      res.status(404).json({ message: `No Job found with ID: ${jobService.getJobId(jobDefinition)}` });
    }
  }),
);

export default router;
