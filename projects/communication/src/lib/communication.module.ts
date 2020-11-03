import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommunicationComponent } from './communication.component';



@NgModule({
  declarations: [CommunicationComponent],
  imports: [
  ],
  exports: [CommunicationComponent]
})
export class CommunicationModule {
  static forRoot(providers: Provider[]): ModuleWithProviders<CommunicationModule> {
    return {
      ngModule: CommunicationModule,
      providers,
    };
  }
}
