import { NotificationType } from './notification';

export type NotificationId = number | string;

export type NotificationConfig = {
  title: string,
  body: string,
  type?: string,
  icon?: string,
  timestamp?: string,
};

export type NotificationData = {
  errorResult: number,
  model: Notification | Notification[] | boolean | string,
  hasError: boolean
};

export type NotificationMessage = {
  recipientId?: string,
  segments?: string[],
  body: string,
};
