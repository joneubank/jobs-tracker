import dotenv from 'dotenv';
import Logger from 'logger';
const logger = Logger('Config');

dotenv.config();

/**
 * Features
 */
const enableTestRoutes = process.env.FEATURE_DEV_TESTING_ROUTES === 'true';
if (enableTestRoutes) {
  logger.warn('🚩 Feature Flag: Developer Test Enpoints are enabled');
}

const enableKafka = process.env.FEATURE_KAFKA_CONNECTION === 'true';
if (enableKafka) {
  logger.warn('🚩 Feature Flag: Kafka Connections are enabled');
}

const enableEsSync = process.env.FEATURE_ES_SYNC === 'true';
if (enableEsSync) {
  logger.warn('🚩 Feature Flag: Elasticsearch Sync is enabled');
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
    auth?: {
      username: string;
      password: string;
    };
    index: string;
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
  mongo: {
    host: string;
    user?: string;
    pass?: string;
  };
  server: {
    port: number;
  };
  features: {
    enableTestRoutes: boolean;
    enableKafka: boolean;
    enableEsSync: boolean;
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
    node: process.env.ES_HOST || 'http://localhost:9200',
    auth: esAuth,
    index: process.env.ES_INDEX || 'jobs-tracker-status',
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
  mongo: {
    host: process.env.MONGO_URL || 'mongodb://localhost:27017/jobs',
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
  },
  server: {
    port: Number(process.env.PORT) || 3211,
  },
  features: {
    enableTestRoutes,
    enableKafka,
    enableEsSync,
  },
};

export default config;
