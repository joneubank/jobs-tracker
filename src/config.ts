import dotenv from 'dotenv';
import Logger from './logger';
const logger = Logger('Config');

dotenv.config();

/**
 * Features
 */
// Disabled by default
const enableTestRoutes = process.env.FEATURE_DEV_TESTING_ROUTES_ENABLED === 'true';
if (enableTestRoutes) {
  logger.warn('Feature Flag: Developer Test Enpoints are enabled');
}

// Enabled by default
const enableKafka = process.env.FEATURE_KAFKA_CONNECTION_DISABLE !== 'true';
if (!enableKafka) {
  logger.warn('Feature Flag: Kafka connections are disabled.');
}

/**
 * Kafka Config Types
 */
export type KafkaConsumerConfiguration = {
  topic: string;
  group: string;
  dlq?: string;

  partitionsConsumedConcurrently?: number;
  heartbeatInterval?: number;
  sessionTimeout?: number;
  rebalanceTimeout?: number;
};
export type KafkaProducerConfiguration = {
  topic: string;
};
export type KafkaTopicConfiguration = {
  topic: string;
  partitions: number;
};
/**
 * Kafka Config Shared Properties
 * */
const jobUpdatesTopic = process.env.KAFKA_JOBUPDATES_TOPIC || 'jobs-tracker-updates';

/**
 * Global Config Definition
 */
type AppConfig = {
  elasticsearch: {
    node: string;
    basicAuth?: {
      username: string;
      password: string;
    };
    indexName: string;
    createIndex: boolean;
    repository?: string;
  };
  kafka: {
    broker: string;
    clientId: string;
    consumers: {
      jobUpdates: KafkaConsumerConfiguration;
    };
    topics: {
      jobUpdates: KafkaTopicConfiguration;
    };
  };
  server: {
    port: number;
  };
  features: {
    enableTestRoutes: boolean;
    enableKafka: boolean;
  };
};

const esAuth =
  process.env.ES_USER && process.env.ES_PASSWORD
    ? {
        username: process.env.ES_USER,
        password: process.env.ES_PASSWORD,
      }
    : undefined;
const config: AppConfig = {
  elasticsearch: {
    node: process.env.ES_NODE || 'http://localhost:9200',
    basicAuth: esAuth,
    indexName: process.env.INDEX_NAME || 'jobs-tracker-status',
    createIndex: process.env.CREATE_SAMPLE_INDEX !== 'false', // true unless set to 'false'
    repository: process.env.ES_SNAPSHOT_REPOSITORY,
  },
  kafka: {
    broker: process.env.KAFKA_BROKER || 'localhost:9092',
    clientId: process.env.KAFKA_CLIENT_ID || 'jobs-tracker',

    consumers: {
      jobUpdates: {
        group: process.env.KAFKA_JOBUPDATES_GROUP || 'jobs-tracker-updates-consumer',
        topic: jobUpdatesTopic,
      },
    },
    topics: {
      jobUpdates: {
        topic: jobUpdatesTopic,
        partitions: Number(process.env.KAFKA_JOBUPDATES_PARTITIONS) || 1,
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 3211,
  },
  features: {
    enableTestRoutes,
    enableKafka,
  },
};

export default config;
