import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, SystemJsNgModuleLoader } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { GoldenLayoutHandler } from './models/golden-layout-handler';
import { LayoutHandler } from './models/layout-handler';
import { LoaderModule } from 'ui';
import { StorageModule } from 'storage';
import { LocalLayoutStore, ILayoutStore } from './store';
import { LazyAssetsModule } from 'lazy-assets';

let entryComponents = [
  LayoutComponent,
];

@NgModule({
  imports: [
    CommonModule,
    LoaderModule,
    StorageModule,
    LazyAssetsModule.forConfig({
      scripts: [{ src: `./lib/goldenlayout/goldenlayout.js` }]
    })
  ],
  declarations: [
    ...entryComponents
  ],
  providers: [
    SystemJsNgModuleLoader,
    {
      provide: ILayoutStore,
      useClass: LocalLayoutStore
    }
  ],
  exports: [
    LayoutComponent,
  ],
  entryComponents
})
export class LayoutModule {
  static forRoot(): ModuleWithProviders<LayoutModule> {
    return {
      ngModule: LayoutModule,
      providers: [
        {
          provide: LayoutHandler,
          useExisting: GoldenLayoutHandler,
          multi: false
        },
        GoldenLayoutHandler,
      ]
    };
  }
}
