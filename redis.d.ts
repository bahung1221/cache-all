declare module 'cache-all/redis' {
  import { RedisClient } from 'redis';

  function init(config?: Config): Promise<void>;

  function set(key: string, value: any, time?: number): Promise<Status>;

  function get(key: string): Promise<Status>;

  function getAll(): Promise<Status>;

  function has(key: string): Promise<boolean>;

  function remove(key: string): Promise<Status>;

  function removeByPattern(pattern: string): Promise<Status>;

  function clear(): Promise<Status>;

  function middleware(time: number, prefix: string): Function;

  export type Status = { status: 0 | 1 }

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
}
