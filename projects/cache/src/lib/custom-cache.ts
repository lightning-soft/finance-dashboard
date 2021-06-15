import { Inject, Optional } from '@angular/core';
import { CacheConfig } from './cache.config';

export interface ICustomCacheConfig {
  clearTimeout?: number;
}

export enum Time {
  OneMinute = 1000 * 60,
  HalfHour = 1000 * 60 * 30,
  OneHour = 1000 * 60 * 60,
}

const defaultCacheClearTimeout = Time.OneHour;
const defaultCacheConfig: ICustomCacheConfig = {
  clearTimeout: defaultCacheClearTimeout,
};

export abstract class CustomCache<T, C extends ICustomCacheConfig = ICustomCacheConfig> {
  private _config: C = null;
  protected _timeout;

  get config() {
    return this._config;
  }

  set config(value: C) {
    this._config = { ...defaultCacheConfig, ...this._config, ...value };
  }

  constructor(
    @Optional() @Inject(CacheConfig) config?: C,
  ) {
    this.config = config;
  }

  abstract get(key: string, setData?: T): T;

  abstract set(key: string, data: T): void;

  abstract clear(): void;

  abstract delete(key: string): T;

  abstract has(key: string): boolean;

  clearTimeout(): void {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  protected configHasProperty(property: keyof C) {
    return this.config && this.config[property] != null;
  }
}
