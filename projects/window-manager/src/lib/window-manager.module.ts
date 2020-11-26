import { ModuleWithProviders, NgModule } from '@angular/core';
import { WindowManagerService } from './window-manager.service';



@NgModule({
  imports: [],
  providers: [WindowManagerService]
})
export class WindowManagerModule {
  static forRoot(): ModuleWithProviders<WindowManagerModule> {
    return {
      ngModule: WindowManagerModule,
      providers: [
        WindowManagerService
      ]
    };
  }
}
