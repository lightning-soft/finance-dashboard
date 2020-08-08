import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, SystemJsNgModuleLoader } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { LoaderComponent } from './components/loader/loader.component';
import { GoldenLayoutHandler } from './models/golden-layout-handler';
import { LayoutHandler } from './models/layout-handler';
import { LayoutService } from './layout.service';

let entryComponents = [
  LayoutComponent,
  LoaderComponent
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ...entryComponents
  ],
  providers: [
    SystemJsNgModuleLoader
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
        LayoutService,
        GoldenLayoutHandler,
        LoaderComponent
      ]
    };
  }
}
