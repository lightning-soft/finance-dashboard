import { NgModule } from '@angular/core';
import { ConfigModule } from 'config';
import { environment } from 'src/environments/environment';
import { CommunicationConfig } from '../http';
import { CommunicationComponent } from './communication.component';



@NgModule({
  declarations: [CommunicationComponent],
  imports: [
    ConfigModule.configure({
      path: environment.config || 'config/config.json',
      configClass: CommunicationConfig,
    }),
  ],
  exports: [CommunicationComponent]
})
export class CommunicationModule { }
