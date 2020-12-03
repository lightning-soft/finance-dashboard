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
}

export class Notification {
  public id: NotificationId = Date.now();
  public status: NotificationStatus = NotificationStatus.UNREADED;
  public createAt: Date;

  public title: string;
  public type: string;
  public body: string;
  public icon: string;

  constructor(config: NotificationConfig) {
    this.type = config.type ?? NotificationType.MESSAGE;
    this.icon = config.icon ?? 'icon-setting-gear';
    this.title = config.title ?? 'Message';

    this.body = config.body ?? '';

    this.createAt = config.timestamp ? new Date(config.timestamp) : new Date();
  }
}
