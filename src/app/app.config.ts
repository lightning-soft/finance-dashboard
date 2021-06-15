import { Injectable } from '@angular/core';
import {
  CommunicationConfig,
  ICommunicationConfig,
  ICommunicationHttpConfig,
  ICommunicationWsConfig,
  IIdentityConfig
} from 'communication';
import { Config } from 'config';

@Injectable({
  providedIn: 'root',
})
export class AppConfig extends Config implements CommunicationConfig {
  http: ICommunicationHttpConfig;
  ws: ICommunicationWsConfig;
  setting: ICommunicationHttpConfig;
  rithmic: ICommunicationConfig;
  zoneDecoder: ICommunicationConfig;
  identity: IIdentityConfig;
}
