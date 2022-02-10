export type NotificationId = number | string;

export type NotificationConfig = {
  title: string,
  body: string,
  type?: string,
  icon?: string,
  hoverInfo?: string;
  sound?: boolean;
  timestamp?: string | number,
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
