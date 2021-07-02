import { Component, ElementRef, HostBinding, HostListener, Input, NgZone } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { NzPlacementType } from 'ng-zorro-antd';
import { NotificationService } from 'notification';
import { NavbarPosition, SettingsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { Bounds, WindowManagerService } from 'window-manager';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() layout: LayoutComponent;

  public readonly navbarPosition = NavbarPosition;
  public isNewNotification: boolean;
  public isNavbarHidden = false;
  private navbarActive = false;
  private isInsideDropdownOpened = false;

  @HostBinding('class') public currentNavbarPosition: NavbarPosition;

  @HostBinding('class.hidden')
  get hidden() {
    return this.isNavbarHidden && !this.navbarActive && !this.isInsideDropdownOpened;
  }

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  get dropdownPlacementRightSide(): NzPlacementType {
    return this.currentNavbarPosition === NavbarPosition.Top ? 'bottomRight' : 'topRight';
  }

  get dropdownPlacementLeftSide(): NzPlacementType {
    return this.currentNavbarPosition === NavbarPosition.Top ? 'bottomLeft' : 'topLeft';
  }

  timeout: number;

  constructor(
    private themeHandler: ThemesHandler,
    private _ngZone: NgZone,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private elementRef: ElementRef,
    private windowManagerService: WindowManagerService,
  ) {
    this.isNewNotification = !!this.notificationService.getNotification().length;
    this.notificationService.notifications.subscribe(n => {
      this.isNewNotification = !!n.length;
    });

    this.settingsService.settings
      .pipe(untilDestroyed(this))
      .subscribe(settings => {
        if (this.currentNavbarPosition !== settings.navbarPosition || this.isNavbarHidden !== settings.isNavbarHidden) {
          this.currentNavbarPosition = settings.navbarPosition;
          this.isNavbarHidden = settings.isNavbarHidden;
        }
        this._updateWindowsBounds();
      });
  }

  @HostListener('mouseenter', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('document:click', ['$event'])
  mouseMove(event: any) {
    const active = event.type === 'mouseenter'
      || (event.type === 'mouseleave' && this._isInBounds(event as HTMLElement))
      || (event.type === 'click' && this._isHostContainsElement(event.target as HTMLElement));

    if (this.navbarActive !== active) {
      if (!active)
        this.timeout = setTimeout(() => this.setNavBarActive(active), 500);
      else
        this.setNavBarActive(active);
    } else if (this.timeout != null) {
      clearTimeout(this.timeout);
    }
  }
  _isInBounds(event) {
      if (this.currentNavbarPosition === NavbarPosition.Top)
        return event.screenY <= this.elementRef.nativeElement.clientTop + this.elementRef.nativeElement.clientHeight;

      if (this.currentNavbarPosition === NavbarPosition.Bottom)
        return event.clientY >= this.elementRef.nativeElement.offsetTop;
  }

  setNavBarActive(active) {
    this._ngZone.run(() => {
      this.navbarActive = active;
      this._updateWindowsBounds();
    });
  }

  handleInsideDropdownToggle(opened: boolean): void {
    this.isInsideDropdownOpened = opened;
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

  private _updateWindowsBounds(): void {
    const bounds: Bounds = this.isNavbarHidden ? null : {
      top: this.currentNavbarPosition === NavbarPosition.Top ? this.elementRef.nativeElement.offsetHeight : 0,
      left: 0,
      bottom: this.windowManagerService.container.offsetHeight,
      right: this.windowManagerService.container.offsetWidth
    };

    this.windowManagerService.setBounds(bounds);
  }

  openNotificationsList(): void {
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

  openSettings(): void {
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

  private _isHostContainsElement(element: Element): boolean {
    return this.elementRef.nativeElement.contains(element);
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

declare var process;

export function isElectron(): boolean {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window['process'] === 'object' && window['process'].type === 'renderer') {
    return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
