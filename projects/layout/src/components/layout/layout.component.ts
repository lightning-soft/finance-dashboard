import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  HostListener,
  NgZone,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { GlobalHandlerService } from 'global-handler';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { WindowManagerService } from 'window-manager';
import { Workspace, WorkspacesManager } from 'workspace-manager';
import { ILayoutStore } from '../../store';
import { DockDesktopLayout } from './layouts/dock-desktop.layout';
import { IDropable } from './layouts/dropable';
import { ComponentOptions, Layout } from './layouts/layout';

export type ComponentInitCallback = (container: GoldenLayout.Container, componentState: any) => void;

@UntilDestroy()
@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements IDropable, AfterViewInit {
  @ViewChild('container')
  container: ElementRef;

  activeWorkspace: Workspace;

  get canDragAndDrop() {
    return this.layout.canDragAndDrop;
  }

  private _initSubscribers = [];
  layout: Layout;

  constructor(
    private _factoryResolver: ComponentFactoryResolver,
    private viewContainer: ViewContainerRef,
    private ngZone: NgZone,
    private _loadingService: LoadingService,
    private _lazyLoadingService: LazyLoadingService,
    private layoutStore: ILayoutStore,
    private _creationsService: LoadingService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _globalHandler: GlobalHandlerService,
    private _windowManagerService: WindowManagerService,
    private _workspacesManager: WorkspacesManager
  ) {
    (window as any).LayoutComponent = this;
  }

  ngAfterViewInit() {
    this._windowManagerService.createWindowManager(this.container);
  }

  getWidgets() {
    return this.layout.getWidgets();
  }

  addComponent(options: ComponentOptions | string) {
      this.layout?.addComponent(options);
  }

  removeComponent(callback: (item) => boolean) {
      this.layout?.removeComponents(callback);
  }

  createDragSource(element, item) {
    this.layout.createDragSource(element, item);
  }

  on(eventName: string, callback) {
    if (eventName === 'init')
      this._initSubscribers.push(callback);
    else
      this.layout.on(eventName, callback);
  }

  off(eventName, callback) {
    this.layout.off(eventName, callback);
  }

  private _initLayout() {
    if (this.layout)
      return;

    this.ngZone.runOutsideAngular(() => {
      // if (Environment.isPhone)
      //   this.layout = new PhoneLayout(this._factoryResolver, this._creationsService,
      //     this.viewContainer, this.container);
      // else
      // this.layout = new DesktopLayout(this._factoryResolver, this._creationsService,
      //   this.viewContainer, this.container, this._lazyLoadingService, this.ngZone);

      this.layout = new DockDesktopLayout(
        this._factoryResolver,
        this._creationsService,
        this.viewContainer,
        this.container,
        this._loadingService,
        this._lazyLoadingService,
        this.ngZone,
        this._windowManagerService
      );
    });
  }

  @HostListener('window:resize')
  public onResize(): void {
    if (this.layout)
      this.layout.handleResize();
  }

  handleEvent(event): boolean {
    return this.layout && this.layout.handleEvent(event);
  }

  getState(): any {
    return this.layout && this.layout.getState();
  }

  loadEmptyState() {
    if (!this.layout)
      this._initLayout();

    this.layout.loadEmptyState();
  }

  hideAll() {
    this._windowManagerService.hideAll();
  }

  async loadState(settings, closeAll = true) {
    let state = settings || [];

    if (this.layout) {
      if (closeAll)
        this._windowManagerService.closeAll();
      else
        this._windowManagerService.hideAll();
    }

    if (!this.layout)
      this._initLayout();

    const result = await this.layout.loadState(state);

    for (const fn of this._initSubscribers) // todo: think about refactoring
      fn();

    this._initSubscribers = [];
    return result;
  }

  saveState(): any {
    return this.getState();
  }
}

const defaultSettings = {
  settings: {
    showPopoutIcon: true,
    showMaximiseIcon: true,
    responsiveMode: 'always'
  },
  dimensions: {
    headerHeight: 30,
    borderWidth: 15,
    minItemWidth: 210,
  },
  content: [
    {
      type: 'row',
      content: new Array(1).fill(1).map(() => ({
        type: 'column',
        content: [
          {
            type: 'component',
            componentName: 'chart'
          },
          {
            type: 'component',
            componentName: 'scripting'
          },
        ]
      })),
    },
  ]
};
