import { ModuleWithProviders, NgModule, SystemJsNgModuleLoader } from '@angular/core';
import { provideRoutes } from '@angular/router';
import { LoadingService, ModulesStoreToken } from './loading.service';
import { Modules, modulesStore } from './constants';

@NgModule()
export class LoadingModule {
  static forRoot(): ModuleWithProviders<LoadingModule> {
    return {
      ngModule: LoadingModule,
      providers: [
        SystemJsNgModuleLoader,
        provideRoutes([
          {
            path: Modules.Chart,
            loadChildren: () => import('../chart/chart.module').then(i => i.ChartModule)
          },
          {
            path: Modules.Watchlist,
            loadChildren: () => import('../watchlist/watchlist.module').then(i => i.WatchlistModule)
          },
          {
            path: Modules.Positions,
            loadChildren: () => import('../position/positions.module').then(i => i.PositionsModule)
          },
        ]),
        {
          provide: ModulesStoreToken,
          useValue: modulesStore,
        },
        LoadingService,
      ]
    };
  }
}
