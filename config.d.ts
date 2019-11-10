import { RedisClient } from 'redis';

export interface Config {
  isEnable?: boolean;
  ttl?: number;
  file?: {
    path?: string;
  };
  redis?: {
    port?: number;
    host?: string;
    client?: RedisClient;
    setex?: Function;
    password?: string;
    database?: string;
    prefix?: string;
  }
}

export type Status = { status: 0 | 1 }
