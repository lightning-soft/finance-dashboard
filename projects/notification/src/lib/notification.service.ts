import { Injectable, Injector } from '@angular/core';
import { WebSocketService, WSEventType } from 'communication';
import { Subject } from 'rxjs';
import { Notification, NotificationStatus, NotificationType } from './notification';
import { NotificationId } from './type';
import { reducer } from './handlers';
import { NotifierService } from 'notifier';
import { Sound, SoundService } from 'sound';
import { map } from 'rxjs/operators';

@Injectable()
export class NotificationService extends NotifierService {

  private _notifications: Notification[] = [];

  public notifications: Subject<Notification[]> = new Subject();
  public newNotifications = this.notifications
    .pipe(
      map(arr => arr.filter(item => item.status === NotificationStatus.UNREADED))
    );

  constructor(
    private _webSocketService: WebSocketService,
    private _injector: Injector,
  ) {
    super();
    this._webSocketService.on(WSEventType.Message, this._handleStream.bind(this));
  }

  showError(message: any, defaultMessage?: string) {
    const { _message, _title, additionalInfo } = this._prepareErrorMessage(message, defaultMessage);
    const notification = new Notification({
      body: _message, title: _title,
      icon: 'notifcation-error',
      hoverInfo: additionalInfo,
      type: NotificationType.MESSAGE
    });
    this.addNotification(notification);
  }

  showSuccess(message: string) {
    const notification = new Notification({ body: message, icon: 'notication-success', title: 'Success', sound: false });
    this.addNotification(notification);
  }

  addNotification(notification: Notification) {
    this._injector.get(SoundService).play(Sound.ALERT);
    this._notifications.unshift(notification);
    this.notifications.next(this.getNotification());
  }

  public acceptNotification(notificationId: NotificationId): void {
    const index = this._notifications.findIndex(n => n.id === notificationId);

    if (index === -1) return;

    this._notifications[index].status = NotificationStatus.ACCEPTED;

    this.notifications.next(this.getNotification());
  }

  public acceptAllNotifications() {
    this._notifications.forEach(item => item.status = NotificationStatus.ACCEPTED);
    this.notifications.next(this.getNotification());
  }

  public getNotification(): Notification[] {
    return this._notifications;
  }

  public getNewNotifications(): Notification[] {
    return this._notifications.filter(item => item.type === NotificationStatus.UNREADED);
  }

  private _handleStream(msg: any): void {
    const notification = reducer(msg);

    if (notification) {
      this.addNotification(notification);
    }
  }

}
