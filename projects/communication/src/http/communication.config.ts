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

export class CommunicationConfig {
  http: ICommunicationHttpConfig;
  ws: ICommunicationWsConfig;
  rithmic: ICommunicationConfig;
  zoneDecoder: ICommunicationConfig;
  setting: ICommunicationHttpConfig;
  identity: IIdentityConfig;
}

export interface IIdentityConfig {
  url: string;
  scope: string[];
  clientId: string;
  clientSecret: string;
  responseType: string;
  redirectUri: string;
  notificationUri: string;
}
