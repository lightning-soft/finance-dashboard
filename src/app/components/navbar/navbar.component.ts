import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { LayoutComponent } from 'layout';
import { NotificationService } from 'notification';
import { Themes, ThemesHandler } from 'themes';
import { NavbarPosition, SettingsService } from "settings";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { fromEvent, merge } from "rxjs";
import { debounceTime, map, tap } from "rxjs/operators";


@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() layout: LayoutComponent;

  public isNewNotification: boolean;
  public readonly navbarPosition = NavbarPosition;

  public isNavbarHidden = false;
  private navbarActive = false;

  @HostBinding('class') public currentNavbarPosition: NavbarPosition;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  constructor(
    private themeHandler: ThemesHandler,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private elementRef: ElementRef
  ) {
    this.notificationService.notifications.subscribe(n => {
      this.isNewNotification = !!n.length;
    });

    this.settingsService.settings
      .pipe(untilDestroyed(this), debounceTime(200))
      .subscribe(settings => {
        this.currentNavbarPosition = settings.navbarPosition;
        this.isNavbarHidden = settings.isNavbarHidden;
      });

    merge(
      fromEvent(this.elementRef.nativeElement, 'mouseleave'),
      fromEvent(this.elementRef.nativeElement, 'mouseover').pipe(tap(() => this.navbarActive = true)),
      fromEvent(document, 'click'),
    ).pipe(
      map((event: MouseEvent) => event.type === 'mouseover' || this._isNavbarFocused()),
      debounceTime(400),
      untilDestroyed(this)
    ).subscribe((active: boolean) => this.navbarActive = active);
  }

  @HostBinding('class.hidden') get hidden() {
    return this.isNavbarHidden && !this.navbarActive;
  }

  // @HostBinding('class.bottom') get positionClass() {
  //   return this.currentNavbarPosition === NavbarPosition.Bottom;
  // }

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
      shouldOpenInNewWindow: false,
      removeIfExists: true,
      maximizable: false,
      minimizable: false,
      resizable: false,
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
      shouldOpenInNewWindow: false,
      x: 'center',
      y: 'center',
      single: true,
      removeIfExists: true,
    });
  }

  changeNavbarPosition(position: NavbarPosition): void {
    this.settingsService.changeNavbarPosition(position);
  }

  changeNavbarVisibility(hidden: boolean): void {
    this.settingsService.updateNavbarVisibility(hidden);
  }

  private _isNavbarFocused(): boolean {
    return this.elementRef.nativeElement.contains(document.activeElement);
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
