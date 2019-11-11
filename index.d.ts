import { RedisClient } from 'redis';
import { RequestHandler } from 'express';

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

export function init(config?: Config): Promise<void>;

export function set(key: string, value: any, time?: number): Promise<Status>;

export function get(key: string): Promise<any>;

export function getAll(): Promise<Array<any>>;

export function has(key: string): Promise<boolean>;

export function remove(key: string): Promise<Status>;

export function removeByPattern(pattern: string | RegExp): Promise<Status>;

export function clear(): Promise<Status>;

export function middleware(time: number, prefix?: string): RequestHandler;
