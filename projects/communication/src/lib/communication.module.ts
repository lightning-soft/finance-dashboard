import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { CommunicationComponent } from './communication.component';

function webSocketServiceFactory() {
  if (!window.deps.get('WebSocketService')) {
    window.deps.set('WebSocketService', new WebSocketService());
  } else {
  }
  return window.deps.get('WebSocketService');
}

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
      providers: [
        ...providers,
        {
          provide: WebSocketService,
          useFactory: webSocketServiceFactory
        }
      ],
    };
  }
}
