import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, SystemJsNgModuleLoader } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GloabalHandlerModule } from 'global-handler';
import { LazyAssetsModule } from 'lazy-assets';
import { NzSelectModule } from 'ng-zorro-antd';
import { StorageModule } from 'storage';
import { LoaderModule } from 'ui';
import { WindowManagerModule } from 'window-manager';
import { LayoutComponent } from './components/layout/layout.component';
import { LinkSelectComponent } from './components/link-select/link-select.component';
import { ILayoutStore, LocalLayoutStore } from './store';
import { WorkspacesModule } from 'workspace-manager';
import { WindowPopupManager } from './services/window-popup-manager';



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
    WorkspacesModule.forRoot(),
    WindowManagerModule,
    ScrollingModule,
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
        WindowPopupManager,
      ]
    };
  }
}
