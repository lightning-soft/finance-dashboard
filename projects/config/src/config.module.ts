import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationConfig } from './configuration.config';
import { PATH } from './path';
import { Config } from './config';

export function initConfig(loader: HttpClient, path: string, config: Config): () => Promise<any> {
  return () => loader
    .get(path)
    .toPromise()
    .then(result => config.apply(result));
}

@NgModule()
export class ConfigModule {
  static configure(config: ConfigurationConfig) {
    return {
      ngModule: ConfigModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: initConfig,
          multi: true,
          deps: [HttpClient, PATH, config.configClass],
        },
        {
          provide: PATH,
          useValue: config.path,
        },
      ],
    };
  }
}
