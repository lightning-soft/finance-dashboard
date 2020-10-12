import { ModuleWithProviders, NgModule, SystemJsNgModuleLoader } from '@angular/core';
import { provideRoutes, Routes } from '@angular/router';
import { LoadingService, ModulesStoreToken } from './loading.service';
import { IModules } from './models';

@NgModule()
export class LoadingModule {
  static forRoot(routes: Routes, modules: IModules[]): ModuleWithProviders<LoadingModule> {
    return {
      ngModule: LoadingModule,
      providers: [
        SystemJsNgModuleLoader,
        provideRoutes(routes),
        {
          provide: ModulesStoreToken,
          useValue: modules,
        },
        LoadingService,
      ]
    };
  }
}
