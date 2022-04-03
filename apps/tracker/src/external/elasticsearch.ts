import { Client } from '@elastic/elasticsearch';
import esMapping from '../resources/job_updates_status-mapping.json';
import config from '../config';
import Logger from 'logger';
const logger = Logger('Elasticsearch');

let esClient: Client;

export async function getClient() {
  if (esClient) {
    return esClient;
  }
  logger.info('Creating ES Client');
  esClient = new Client({
    node: config.elasticsearch.node,
    auth: config.elasticsearch.basicAuth,
  });

  logger.info('Testing ES Connection...');
  await esClient.ping();
  logger.info('ES Connection successful');

  if (config.elasticsearch.createIndex) {
    logger.info(`Ensuring index exsists: ${config.elasticsearch.indexName}`);
    const indexExists = await checkIndexExists(config.elasticsearch.indexName);
    if (indexExists) {
      logger.info(`Index already exists`);
    } else {
      logger.info(`Index does not exist, creating...`);
      await createIndex(config.elasticsearch.indexName);
      logger.info(`Index created`);
    }
  }

  logger.info('ES Client ready');
  return esClient;
}

export const checkIndexExists = async (index: string): Promise<boolean> => {
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
};

export const createIndex = async (index: string) => {
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
};
