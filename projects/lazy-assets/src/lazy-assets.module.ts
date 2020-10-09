import { ModuleWithProviders, NgModule } from '@angular/core';
import { LazyLoadingService, LazyLoadingServiceConfig } from './lazy-loading.service';

@NgModule()
export class LazyAssetsModule {
  static forConfig(config: LazyLoadingServiceConfig): ModuleWithProviders<LazyAssetsModule> {
    return {
      ngModule: LazyAssetsModule,
      providers: [
        {
          provide: LazyLoadingServiceConfig,
          useValue: config,
        },
        LazyLoadingService,
      ]
    };
  }
}
