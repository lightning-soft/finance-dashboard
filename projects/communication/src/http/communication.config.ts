import { Injectable } from '@angular/core';
import { Config } from 'config';

export interface ICommunicationHttpConfig {
  url: string;
}

export interface ICommunicationWsConfig {
  url: string;
}

export interface ICommunicationConfig {
  http: ICommunicationHttpConfig;
  ws: ICommunicationWsConfig;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationConfig extends Config {
  http: ICommunicationHttpConfig;
  ws: ICommunicationWsConfig;
  rithmic: ICommunicationConfig;
}
