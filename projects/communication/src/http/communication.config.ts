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
}
