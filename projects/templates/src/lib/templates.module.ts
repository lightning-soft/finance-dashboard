import { ModuleWithProviders, NgModule } from '@angular/core';
import { TemplatesService } from "./templates.service";

@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class TemplatesModule {
  static forRoot(): ModuleWithProviders<TemplatesModule> {
    return {
      ngModule: TemplatesModule,
      providers: [
        TemplatesService,
      ]
    };
  }
}
