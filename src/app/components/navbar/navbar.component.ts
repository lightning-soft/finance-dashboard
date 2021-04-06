import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { LayoutComponent } from 'layout';
import { NotificationService } from 'notification';
import { Themes, ThemesHandler } from 'themes';
import { NavbarPosition, SettingsService } from 'settings';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, delay, map, tap } from 'rxjs/operators';
import { NzPlacementType } from 'ng-zorro-antd';
import { Bounds, WindowManagerService } from 'window-manager';

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

  @HostBinding('class.hidden') get hidden() {
    return this.isNavbarHidden && !this.navbarActive;
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
      top: this.elementRef.nativeElement.offsetHeight,
      left: 0,
      bottom: this.windowManagerService.container.offsetHeight,
      right: this.windowManagerService.container.offsetWidth
    };

    this.windowManagerService.setBounds(bounds);
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
