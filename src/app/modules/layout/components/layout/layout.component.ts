import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  SystemJsNgModuleLoader,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { GoldenLayoutHandler } from '../../models/golden-layout-handler';
import { DesktopLayout } from './layouts/desktop.layout';
import { Layout } from './layouts/layout';
import { IDropable } from './layouts/dropable';

export type ComponentInitCallback = (container: GoldenLayout.Container, componentState: any) => void;
@UntilDestroy()
@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, IDropable {
  @ViewChild('container')
  container: ElementRef;

  get canDragAndDrop() {
    return this.layout.canDragAndDrop;
  }

  private _initSubscribers = [];
  layout: Layout;

  constructor(private _factoryResolver: ComponentFactoryResolver,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private ngZone: NgZone,
    private _loader: SystemJsNgModuleLoader,
    private _lazyLoadingService: LazyLoadingService,
    private _layoutHandler: GoldenLayoutHandler,
    // private readonly injector: Injector,
    private _creationsService: LoadingService,
    // private _contextMenuTrigger: ContextMenuTrigger
  ) {
  }

  ngOnInit() {
    (window as any).l = this;
    // this.ngZone.runOutsideAngular(() =>
    this._layoutHandler
      .handleCreate
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(name => this.addComponent(name));
    // );
  }

  addComponent(name: string) {
    if (this.layout)
      this.layout.addComponent(name);
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
      this.layout = new DesktopLayout(this._factoryResolver, this._creationsService,
        this.viewContainer, this.container, this._lazyLoadingService);
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

  saveState(): any {
    return this.layout && this.layout.saveState();
  }

  loadEmptyState() {
    if (!this.layout)
      this._initLayout();

    this.layout.loadEmptyState();
  }

  async loadState(state: any) {
    if (!this.layout)
      this._initLayout();

    const result = await this.layout.loadState(state);
    for (const fn of this._initSubscribers) // todo: think about refactoring
      fn();
    this._initSubscribers = [];
    return result;
  }
}

function isInput(element: Element): boolean {
  return element && element.tagName === 'INPUT';
}
