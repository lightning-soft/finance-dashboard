import { Injectable, Injector } from '@angular/core';
import { WebSocketService, WSEventType } from 'communication';
import { Subject } from 'rxjs';
import { Notification, NotificationStatus, NotificationType } from './notification';
import { NotificationId } from './type';
import { reducer } from './handlers';
import { NotifierService } from 'notifier';
import { SoundService, Sound } from 'sound';

@Injectable()
export class NotificationService extends NotifierService {

  private _notifications: Notification[] = [];

  public notifications: Subject<Notification[]> = new Subject();

  constructor(
    private _webSocketService: WebSocketService,
    private _injector: Injector,
  ) {
    super();
    this._webSocketService.on(WSEventType.Message, this._handleStream.bind(this));
  }

  showError(message: any, defaultMessage?: string) {
    const { _message, _title } = this._prepareErrorMessage(message, defaultMessage);
    const notification = new Notification({
      body: _message, title: _title,
      icon: 'notifcation-error',
      type: NotificationType.MESSAGE
    });
    this.addNotification(notification);
  }

  showSuccess(message: string) {
    const notification = new Notification({ body: message, icon: 'notication-success', title: 'Success' });
    this.addNotification(notification);
  }

  addNotification(notification) {
    this._injector.get(SoundService).play(Sound.ALERT);
    this._notifications.unshift(notification);
    this.notifications.next(this.getNotification());
  }

  public acceptNotification(notificationId: NotificationId): void {
    const notification = this._notifications.find(n => n.id === notificationId);
    notification.status = NotificationStatus.ACCEPTED;

    this.notifications.next(this.getNotification());
  }

  public acceptAllNotifications() {
    this._notifications.forEach(item => item.status = NotificationStatus.ACCEPTED);
    this.notifications.next(this.getNotification());
  }

  public getNotification(): Notification[] {
    const notifications = this._filterUnreaded(this._notifications);
    return notifications;
  }

  private _filterUnreaded(notifications: Notification[]): Notification[] {
    return notifications.filter(n => n.status === NotificationStatus.UNREADED);
  }

  private _handleStream(msg: any): void {
    const notification = reducer(msg);

    if (notification) {
      this.addNotification(notification);
    }
  }

}
