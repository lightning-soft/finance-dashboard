import { Config } from './config';

export interface ConfigurationConfig {
  path: string;
  configClass: new (...args: any[]) => Config;
}
