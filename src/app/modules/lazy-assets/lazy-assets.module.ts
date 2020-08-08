import { ModuleWithProviders, NgModule } from '@angular/core';
import { LazyLoadingService } from './lazy-loading.service';

@NgModule()
export class LazyAssetsModule {
    static forRoot(): ModuleWithProviders<LazyAssetsModule> {
        return {
            ngModule: LazyAssetsModule,
            providers: [
                LazyLoadingService,
            ]
        };
    }
}
