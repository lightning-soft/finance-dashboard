import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { LayoutComponent } from 'layout';
import { NotificationService } from 'notification';
import { Themes, ThemesHandler } from 'themes';
import { NavbarPosition, SettingsService } from "settings";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { fromEvent, merge } from "rxjs";
import { debounceTime, map, tap } from "rxjs/operators";
import { NzPlacementType } from "ng-zorro-antd";
import {WindowManagerService} from "window-manager";


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

  public currentNavbarPosition: NavbarPosition;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  get dropdownPlacementRightSide(): NzPlacementType {
    return this.currentNavbarPosition === NavbarPosition.Top ? 'bottomRight' : 'topRight';
  }

  get dropdownPlacementLeftSide(): NzPlacementType {
    return this.currentNavbarPosition === NavbarPosition.Top ? 'bottomLeft' : 'topLeft';
  }

  constructor(
    private themeHandler: ThemesHandler,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private elementRef: ElementRef,
    private windowManagerService: WindowManagerService,
  ) {
    this.isNewNotification =   !!this.notificationService.getNotification().length;
    this.notificationService.notifications.subscribe(n => {
      this.isNewNotification = !!n.length;
    });

    this.settingsService.settings
      .pipe(untilDestroyed(this), debounceTime(200))
      .subscribe(settings => {
        if (this.currentNavbarPosition !== settings.navbarPosition) {
          this.currentNavbarPosition = settings.navbarPosition;
          this.windowManagerService.updateGlobalOffset();
        }
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
      allowPopup: false,
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
      allowPopup: false,
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
