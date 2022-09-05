import { Client } from '@elastic/elasticsearch';
import esMapping from '../resources/job_updates_status-mapping.json';
import config from '../config';
import Logger from 'logger';
import { ServiceStatus } from './types';
const logger = Logger('Elasticsearch');

let esClient: Client;

export let connectionStatus: ServiceStatus = ServiceStatus.Unknown;

export async function getClient(): Promise<Client> {
  if (esClient) {
    return esClient;
  }
  logger.info('Creating ES Client');
  esClient = new Client({
    node: config.elasticsearch.node,
    auth: config.elasticsearch.auth,
  });

  await checkConnectionStatus();

  logger.info(`Ensuring index exsists: ${config.elasticsearch.index}`);
  const indexExists = await checkIndexExists(config.elasticsearch.index);
  if (indexExists) {
    logger.info(`Index already exists`);
  } else {
    logger.info(`Index does not exist, creating...`);
    await createIndex(config.elasticsearch.index);
    logger.info(`Index created`);
  }

  logger.info('ES Client ready');
  return esClient;
}

export async function checkConnectionStatus(): Promise<boolean> {
  logger.info('Testing ES Connection...');
  const response = await esClient.ping();
  if (response.statusCode && response.statusCode >= 200 && response?.statusCode < 300) {
    logger.info('ES Connection successful');
    connectionStatus = ServiceStatus.Connected;
    return true;
  } else {
    logger.error('Unable to connect to ElasticSearch.');
    connectionStatus = ServiceStatus.Error;
    return false;
  }
}

export async function checkIndexExists(index: string): Promise<boolean> {
  try {
    logger.debug(`Checking ES for index: ${index}`);
    await esClient.indices.get({
      index: index,
    });
    logger.debug(`Index exists: ${index}`);
    return true;
  } catch (e) {
    if ((<Error>e).name === 'ResponseError' && (<Error>e).message === 'index_not_found_exception') {
      logger.debug(`Index does not exist: ${index}`);
      return false;
    } else {
      logger.error(`Failed to check index ${index}`);
      throw e;
    }
  }
}

export async function createIndex(index: string) {
  try {
    logger.info(`Creating index ${index}`);
    await esClient.indices.create({
      index: index,
      body: esMapping,
    });
  } catch (e) {
    if ((<Error>e).name === 'ResponseError' && (<Error>e).message === 'resource_already_exists_exception') {
      logger.info(`Index ${index} already exist.`);
    } else {
      logger.error(`Failed to check index ${index} ${e}`);
      throw e;
    }
  }
}
