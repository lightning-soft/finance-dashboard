import { Injectable } from '@angular/core';
import { WebSocketService } from 'communication';
import { Subject } from 'rxjs';
import { Notification, NotificationStatus } from './notification';
import { NotificationId } from './type';
import { reducer } from './handlers';


@Injectable()
export class NotificationService {

  private _notifications: Notification[] = [];

  public notifications: Subject<Notification[]> = new Subject();

  constructor(
    private _webSocketService: WebSocketService
  ) {
    this._webSocketService.on(this._handleStream.bind(this));
  }

  public acceptNotification(notificationId: NotificationId): void {
    const notification = this._notifications.find(n => n.id === notificationId);
    notification.status = NotificationStatus.ACCEPTED;

    this.notifications.next(this.getNotification());
  }

  public getNotification(): Notification[] {
    const notifications = this._filterUnreaded(this._notifications);
    return [...notifications];
  }

  private _filterUnreaded(notifications: Notification[]): Notification[] {
    return notifications.filter(n => n.status === NotificationStatus.UNREADED);
  }

  private _handleStream(msg: any): void {
    const notification = reducer(msg);

    if (notification) {
      this._notifications.push(notification);
      this.notifications.next(this.getNotification());
    }
  }

}
