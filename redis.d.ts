declare module 'cache-all/redis' {
  type Config = import('./config').Config;
  type Status = import('./config').Status;
  type RequestHandler = import('express').RequestHandler;

  function init(config?: Config): Promise<void>;

  function set(key: string, value: any, time?: number): Promise<Status>;

  function get(key: string): Promise<any>;

  function getAll(): Promise<Array<any>>;

  function has(key: string): Promise<boolean>;

  function remove(key: string): Promise<Status>;

  function removeByPattern(pattern: string | RegExp): Promise<Status>;

  function clear(): Promise<Status>;

  function middleware(time: number, prefix?: string): RequestHandler;
}
