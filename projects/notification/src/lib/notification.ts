import { NotificationConfig, NotificationId } from './type';

export enum NotificationStatus {
  UNREADED = 'UNREADED',
  ACCEPTED = 'ACCEPTED',
}

export enum NotificationType {
  QUOTE = 'QUOTE',

  MESSAGE = 'MESSAGE',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ORDER_REJECTED = 'ORDER_REJECTED',
  ORDER_RESOLVED = 'ORDER_RESOLVED',
  ERROR = 'ERROR',
}

export class Notification {
  public id: NotificationId = Date.now();
  public status: NotificationStatus = NotificationStatus.UNREADED;
  public createAt: Date;

  public title: string;
  public type: string;
  public body: string;
  public icon: string;
  hoverInfo: string;
  sound = true;

  constructor(config: NotificationConfig) {
    this.type = config.type ?? NotificationType.MESSAGE;
    this.icon = config.icon ?? 'notication-default';
    this.title = config.title ?? 'Message';
    this.hoverInfo = config.hoverInfo;
    this.body = config.body ?? '';
    this.sound = config.sound !== false;

    this.createAt = config.timestamp ? new Date(config.timestamp) : new Date();
  }
}
