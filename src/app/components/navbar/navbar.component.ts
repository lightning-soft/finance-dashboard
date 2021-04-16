import { AfterViewInit, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { LayoutComponent } from 'layout';
import { NotificationService } from 'notification';
import { Themes, ThemesHandler } from 'themes';
import { NavbarPosition, SettingsService } from 'settings';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { NzPlacementType } from 'ng-zorro-antd';
import { Bounds, WindowManagerService } from 'window-manager';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements AfterViewInit {
  @Input() layout: LayoutComponent;

  public readonly navbarPosition = NavbarPosition;
  public isNewNotification: boolean;
  public isNavbarHidden = false;
  private navbarActive = false;
  private isInsideDropdownOpened = false;

  @HostBinding('class.is-electron') public isElectron: boolean;
  @HostBinding('class') public currentNavbarPosition: NavbarPosition;

  @HostBinding('class.hidden') get hidden() {
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

  constructor(
    private themeHandler: ThemesHandler,
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
          this._updateWindowsBounds();
        }
      });

    merge(
      fromEvent(this.elementRef.nativeElement, 'mouseleave'),
      fromEvent(this.elementRef.nativeElement, 'mouseover').pipe(tap(() => {
        this.navbarActive = true;
        this._updateWindowsBounds();
      })),
      fromEvent(document, 'click'),
    ).pipe(
      map((event: MouseEvent) => {
        return event.type === 'mouseover' || this._isHostContainsElement(document.activeElement) || (
          event.type === 'click' && this._isHostContainsElement(event.target as HTMLElement)
        );
      }),
      debounceTime(500),
      untilDestroyed(this)
    ).subscribe((active: boolean) => {
      if (this.navbarActive !== active) {
        this.navbarActive = active;
        this._updateWindowsBounds();
      }
    });
  }

  ngAfterViewInit(): void {
    this.isElectron = isElectron();
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

function isElectron(): boolean {
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
