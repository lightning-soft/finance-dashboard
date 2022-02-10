import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnInit,
  Output
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutComponent, WindowPopupManager } from 'layout';
import { NzPlacementType } from 'ng-zorro-antd';
import { NotificationService } from 'notification';
import { NavbarPosition, SettingsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { Bounds, WindowManagerService } from 'window-manager';
import { isElectron } from '../../is-electron';
import { NotificationListComponent } from 'notification-list';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements AfterViewInit, OnInit {
  @Input() layout: LayoutComponent;

  public readonly navbarPosition = NavbarPosition;
  public isNewNotification: boolean;
  public isNavbarHidden = false;
  private navbarActive = false;
  private navbarActive$ = new Subject<boolean>();
  private isInsideDropdownOpened = false;
  @Output() save = new EventEmitter();
  windowName: string;

  @HostBinding('class') public currentNavbarPosition: NavbarPosition;

  isMaximized = false;

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

  @HostBinding('class.electron')
  isElectron = false;

  constructor(
    private themeHandler: ThemesHandler,
    private _ngZone: NgZone,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private elementRef: ElementRef,
    private windowManagerService: WindowManagerService,
    private _windowPopupManager: WindowPopupManager,
  ) {
    this.isNewNotification = !!this.notificationService.getNewNotifications().length;
    this.notificationService.newNotifications.subscribe(n => {
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
    this.navbarActive$
      .pipe(
        debounceTime(100),
        untilDestroyed(this)
      ).subscribe((res) => {
      this._setNavBarActive(res);
    });
  }

  ngOnInit() {
    this.windowName = this._windowPopupManager.getWindowName();
  }

  ngAfterViewInit() {
    this.isElectron = isElectron();
    (window as any).api?.ipc.on('maximize', (maximize) => {
      this.isMaximized = maximize;
    });
  }

  // @HostListener('mouseenter', ['$event'])
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:click', ['$event'])
  mouseMove(event: any) {
    const active = // event.type === 'mouseenter' ||
      (event.type === 'mousemove' && this._isInBounds(event as HTMLElement))
      || (event.type === 'click' && this._isHostContainsElement(event.target as HTMLElement));
    if (this.navbarActive !== active) {
      if (!active)
        this.timeout = setTimeout(() => this.setNavBarActive(active), 500);
      else {
        this.setNavBarActive(active);
      }
    } else if (this.timeout != null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  _isInBounds(event) {
    if (this.currentNavbarPosition === NavbarPosition.Top) {
      return event.y < this.elementRef.nativeElement.clientTop + this.elementRef.nativeElement.clientHeight;
    }

    if (this.currentNavbarPosition === NavbarPosition.Bottom) {
      return event.clientY >= this.elementRef.nativeElement.offsetTop;
    }
  }

  setNavBarActive(active: boolean) {
    this.navbarActive$.next(active);
  }

  private _setNavBarActive(active) {
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
    const sizes = NotificationListComponent.getSizes();
    this.layout.addComponent({
      component: {
        name: 'notification-list'
      },
      x: 'right',
      y: 'top',
      height: 800,
      width: 300,
      minWidth: 225,
      single: true,
      allowPopup: false,
      removeIfExists: true,
      maximizable: false,
      minimizable: false,
      resizable: true,
      ...sizes,
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

  saveWindow() {
    this.save.emit();
  }

  nativeClose() {
    sendIpcCommand('nativeClose');
  }

  nativeMinimize() {
    sendIpcCommand('nativeMinimize');
  }

  nativeMaximize() {
    sendIpcCommand('nativeMaximize');
  }
}
const sendIpcCommand = (command) => {
  (window as any).api?.ipc.send(command);
};
