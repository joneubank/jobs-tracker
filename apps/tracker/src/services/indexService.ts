import { getJobId, Job } from 'data-model';
import { Result, success, failure } from 'optionals';

import { getClient } from '../external/elasticsearch';

import Logger, { unknownToString } from 'logger';
import config from '../config';
import { mongoJobToPojo } from './dbService';
const logger = Logger('Service.Index');

export async function indexJob(job: Job): Promise<Result<Job, string>> {
  if (!config.features.enableEsSync) {
    logger.debug(`ElasticSearch Sync feature is disabled. Job not indexed.`);
    return failure('ElasticSearch Sync Feature Disabled');
  }

  const jobId = getJobId(job);

  const client = await getClient();

  try {
    logger.debug('Attempting to index', jobId);
    const esResonse = await client.index({
      index: config.elasticsearch.index,
      id: getJobId(job),
      body: job,
    });
    logger.debug('Indexing successful', jobId);
    return success(job);
  } catch (e) {
    const errMessage = `Failed to index job: ${jobId} - ${unknownToString(e)}`;
    logger.error(errMessage);
    return failure(errMessage);
  }
  return success(job);
}
