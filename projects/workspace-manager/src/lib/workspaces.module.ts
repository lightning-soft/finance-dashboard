import { ModuleWithProviders, NgModule } from '@angular/core';
import { WorkspacesStore } from './workspaces-storage';
import { WorkspacesManager } from './workspaces-manager';



@NgModule({
  declarations: [],
  imports: [
  ],
  providers: [
    WorkspacesStore,
  ]
})
export class WorkspacesModule {
  static forRoot(): ModuleWithProviders<WorkspacesModule> {
    return {
      ngModule: WorkspacesModule,
      providers: [
        WorkspacesManager,
      ]
    };
  }
}