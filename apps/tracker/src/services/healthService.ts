import { connectionStatus as mongoConnection } from '../external/mongo';
import { connectionStatus as esConnection, checkConnectionStatus as esConnectionTest } from '../external/elasticsearch';
import config from '../config';
import { ServiceStatus } from '../external/types';

export type ConnectionStatus = {
  elasticserach?: ServiceStatus;
  kafka?: ServiceStatus;
  mongo: ServiceStatus;
};

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  await esConnectionTest();

  const output: ConnectionStatus = { mongo: mongoConnection };
  if (config.features.enableEsSync) {
    output.elasticserach = esConnection;
  }

  if (config.features.enableKafka) {
    output.kafka = ServiceStatus.Unknown;
  }

  return output;
}
