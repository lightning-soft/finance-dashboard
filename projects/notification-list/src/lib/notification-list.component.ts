import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'auth';
import { ILayoutNode, LayoutNode } from 'layout';
import {
  NotificationService,
  Notification
} from 'notification';
import * as moment from 'moment';

interface NotificationGroup {
  notifications: Notification[];

}

export interface NotificationListComponent extends ILayoutNode {
}

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

  constructor(
    private _notificationService: NotificationService,
    public auth: AuthService
  ) {
    this._handleNotifications(this._notificationService.getNotification());
    this._notificationService.notifications.subscribe(res => {
      this._handleNotifications(res);
    });
    this.setTabTitle('Notifications');
    this.setTabIcon('icon-notification');
  }

  private _handleNotifications(notifications: Notification[]) {
    this.notificationsGroup = groupNotifications(notifications);
    this.hasNotifications = !!notifications.length;
  }

  closeList(): void {
    this.visible = false;
  }

  public acceptAllNotifications() {
    this._notificationService.acceptAllNotification();
  }

  public acceptNotification(id) {
    this._notificationService.acceptNotification(id);
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
