import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'auth';
import { ILayoutNode, LayoutNode } from 'layout';
import {
  NotificationService,
  Notification
} from 'notification';

export interface NotificationListComponent extends ILayoutNode {}

@UntilDestroy()
@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
@LayoutNode()
export class NotificationListComponent {

  notifications: Notification[] = [];
  visible = false;

  constructor(
    private _notificationService: NotificationService,
    public auth: AuthService
  ) {
    this.notifications = this._notificationService.getNotification();
    this._notificationService.notifications.subscribe(res => {
      console.log(res);
      

      this.notifications = [...res];
    });

    this.setTabTitle('Notifications');
  }

  closeList(): void {
    this.visible = false;
  }

  public acceptNotification(id) {
    this._notificationService.acceptNotification(id);
  }
}
