import { Injectable } from '@angular/core';
import { CommunicationConfig, ICommunicationConfig, ICommunicationHttpConfig, ICommunicationWsConfig } from 'communication';
import { Config } from 'config';

@Injectable({
  providedIn: 'root',
})
export class AppConfig extends Config implements CommunicationConfig {
  http: ICommunicationHttpConfig;
  ws: ICommunicationWsConfig;
  rithmic: ICommunicationConfig;
}
