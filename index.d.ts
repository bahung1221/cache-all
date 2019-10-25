export interface Cache {
  get(key: string, value: any, ttl?: number): any;
}

export class redis implements Cache {
  constructor(options: any);
  get(key: string, value: any, ttl?: number): any;
  set(key: string);
}
