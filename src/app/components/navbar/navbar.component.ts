import { Component, Input } from '@angular/core';
import { LayoutComponent } from 'layout';
import { NotificationService } from 'notification';
import { Themes, ThemesHandler } from 'themes';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() layout: LayoutComponent;

  public isNewNotification: boolean;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  constructor(
    private themeHandler: ThemesHandler,
    private notificationService: NotificationService,
  ) {
    this.isNewNotification =   !!this.notificationService.getNotification().length;
    this.notificationService.notifications.subscribe(n => {
      this.isNewNotification = !!n.length;
    });
  }

  switchTheme() {
    this.themeHandler.toggleTheme();
  }

  openAccounts() {
    this.layout.addComponent({
      component: {
        name: 'accounts',
      },
      maximizable: false,
    });
  }

  openNotificationsList() {
    this.layout.addComponent({
      component: {
        name: 'notification-list'
      },
      x: 'right',
      y: 'top',
      height: 800,
      width: 300,
      minWidth: 300,
      single: true,
      removeIfExists: true,
      maximizable: false,
      minimizable: false,
      resizable: true,
    });
  }

  openSettings() {
    this.layout.addComponent({
      component: {
        name: 'settings',
      },
      icon: 'icon-setting-gear',
      maximizable: false,
      minimizable: false,
      resizable: false,
      width: 618,
      height: 474,
      x: 'center',
      y: 'center',
      single: true,
      removeIfExists: true,
    });
  }

  // openWorkspace() {
  //   this.layout.addComponent({
  //     component: {
  //       name: 'workspace',
  //     },

  //     icon: 'icon-setting-gear',
  //     maximizeBtn: false,
  //   });
  // }
}
