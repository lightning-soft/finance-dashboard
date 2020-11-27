import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { GlobalHandlerService } from 'global-handler';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { WindowManagerService } from 'window-manager';
import { GoldenLayoutHandler } from '../../models/golden-layout-handler';
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
export class LayoutComponent implements OnInit, IDropable, AfterViewInit {
  @ViewChild('container')
  container: ElementRef;

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
    private _layoutHandler: GoldenLayoutHandler,
    private layoutStore: ILayoutStore,
    private _creationsService: LoadingService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _globalHandler: GlobalHandlerService,
    private _windowManagerService: WindowManagerService,
  ) {
    (window as any).LayoutComponent = this;
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this._windowManagerService.createWindowManager(this.container);
  }

  addComponent(options: ComponentOptions) {
    if (this.layout)
      this.layout.addComponent(options);
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

  @HostListener(`window:keyup`, ['$event'])
  @HostListener(`window:keydown`, ['$event'])
  public onEvent(event): void {
    // if (this._contextMenuTrigger && this._contextMenuTrigger.isOpen || isInput(event && event.srcElement))
    //   return;

    if (this.layout)
      this.layout.handleEvent(event);
  }

  getState(): any {
    return this.layout && this.layout.getState();
  }

  loadEmptyState() {
    if (!this.layout)
      this._initLayout();

    this.layout.loadEmptyState();
  }

  async loadState() {
    const state = await this.layoutStore.getItem().toPromise() || defaultSettings;
    if (!this.layout)
      this._initLayout();

    const result = await this.layout.loadState(state);
    for (const fn of this._initSubscribers) // todo: think about refactoring
      fn();
    this._initSubscribers = [];
    return result;
  }

  /**
   * HostListener is used because ngOnDestroy is not being triggered during page close/refresh
   * If in this function error occurred then will be shown a confirm dialog with a message "Changes that you made may not be saved."
   */
  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    this.saveState();
  }

  saveState(): void {
    this.layoutStore.setItem(this.getState());
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
