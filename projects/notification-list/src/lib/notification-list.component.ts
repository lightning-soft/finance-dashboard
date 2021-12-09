import { Component, NgZone } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from 'auth';
import { ILayoutNode, LayoutNode } from 'layout';
import { Notification, NotificationService, NotificationStatus } from 'notification';
import * as moment from 'moment';

export interface NotificationListComponent extends ILayoutNode {
}

const notificationListSize = 'notificationListSize';

@UntilDestroy()
@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
@LayoutNode()
export class NotificationListComponent {

  notificationsGroup: any = [];
  visible = false;
  hasNotifications = false;
  statuses = NotificationStatus;

  public static getSizes() {
    try {
      return JSON.parse(localStorage.getItem(notificationListSize));
    } catch (e) {
      return {};
    }
  }

  constructor(
    private _notificationService: NotificationService,
    private _ngZone: NgZone,
    public auth: AuthService
  ) {
    this._handleNotifications(this._notificationService.getNotification());
    this._notificationService.notifications.subscribe(res => {
      this._handleNotifications(res);
    });
    this.setTabTitle('Notifications');
    this.setTabIcon('icon-notification');
    this.onRemove(this.destroy.bind(this));
  }

  private _handleNotifications(notifications: Notification[]): void {
    this._ngZone.run(() => {
      this.notificationsGroup = groupNotifications(notifications);
      this.hasNotifications = !!notifications.length;
    });
  }

  closeList(): void {
    this.visible = false;
  }

  public acceptAllNotifications() {
    this._notificationService.acceptAllNotifications();
  }

  public acceptNotification(id) {
    this._notificationService.acceptNotification(id);
  }

  destroy() {
    const height = this.layoutContainer.options.height;
    const width = this.layoutContainer.options.width;
    localStorage.setItem(notificationListSize, JSON.stringify({ height, width }));
  }
}

function groupNotifications(notifications: Notification[]) {
  const notificationMap = notifications.reduce((prev, current) => {
    const date = current.createAt;
    const yesterday = new Date();
    yesterday.setTime(yesterday.getTime() - 1000 * 60 * 60 * 24);
    let key;
    if (isToday(date)) {
      key = '';
    } else if (isSameDay(date, yesterday)) {
      key = 'Yesterday';
    } else {
      key = moment(date as any).format('DD MMMM, yyyy');
    }
    if (!Array.isArray(prev[key])) {
      prev[key] = [];
    }
    prev[key].push(current);
    return prev;
  }, {});
  return Object.keys(notificationMap).map(date => ({ date, notifications: notificationMap[date] }));
}

function isToday(date) {
  const today = new Date();
  return isSameDay(today, date);
}

function isSameDay(a, b) {
  return moment(a).isSame(b, 'day');
}
