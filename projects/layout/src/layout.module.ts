import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, SystemJsNgModuleLoader } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd';
import { LayoutComponent } from './components/layout/layout.component';
import { LinkSelectComponent } from './components/link-select/link-select.component';
import { GoldenLayoutHandler } from './models/golden-layout-handler';
import { LayoutHandler } from './models/layout-handler';
import { LoaderModule } from 'ui';
import { StorageModule } from 'storage';
import { LocalLayoutStore, ILayoutStore } from './store';
import { LazyAssetsModule } from 'lazy-assets';
import { GloabalHandlerModule } from 'global-handler';
import { WindowManagerModule } from 'window-manager';

const entryComponents = [
  LayoutComponent,
];

@NgModule({
  imports: [
    CommonModule,
    LoaderModule,
    StorageModule,
    FormsModule,
    NzSelectModule,
    GloabalHandlerModule,
    WindowManagerModule,
    LazyAssetsModule.forConfig({}),
  ],
  declarations: [
    ...entryComponents,
    LinkSelectComponent,
  ],
  providers: [
    SystemJsNgModuleLoader,
    {
      provide: ILayoutStore,
      useClass: LocalLayoutStore
    },
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
