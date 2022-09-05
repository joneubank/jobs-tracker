import mongoose from 'mongoose';
import { ServiceStatus } from '../types';
import config from '../../config';
import Logger from 'logger';
const logger = Logger('Mongo');

export let connectionStatus: ServiceStatus = ServiceStatus.Unknown;

export const connectDb = async () => {
  /** Mongoose setup */
  mongoose.connection.on('connecting', () => {
    logger.info('Connecting to MongoDB...');
  });
  mongoose.connection.on('connected', () => {
    logger.info('Connection Established to MongoDB');
    connectionStatus = ServiceStatus.Connected;
  });
  mongoose.connection.on('reconnected', () => {
    logger.info('Connection Reestablished');
    connectionStatus = ServiceStatus.Connected;
  });
  mongoose.connection.on('disconnected', (args: any[]) => {
    logger.warn('Connection Disconnected ' + JSON.stringify(args));
    connectionStatus = ServiceStatus.Error;
  });
  mongoose.connection.on('close', () => {
    logger.warn('Connection Closed');
    connectionStatus = ServiceStatus.Error;
  });
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB Connection Error:' + error);
    connectionStatus = ServiceStatus.Error;
  });
  mongoose.connection.on('reconnectFailed', () => {
    logger.error('Ran out of reconnect attempts, abandoning...');
    connectionStatus = ServiceStatus.Error;
  });

  try {
    await mongoose.connect(config.mongo.host, {
      user: config.mongo.user,
      pass: config.mongo.pass,
      keepAlive: true,
    });
  } catch (err) {
    logger.error('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    process.exit();
  }
};
