import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  HostListener,
  NgZone, OnDestroy,
  OnInit,
  SystemJsNgModuleLoader,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { GoldenLayoutHandler } from '../../models/golden-layout-handler';
import { DesktopLayout } from './layouts/desktop.layout';
import { Layout } from './layouts/layout';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export type ComponentInitCallback = (container: GoldenLayout.Container, componentState: any) => void;

@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {

  private destroy = new Subject<boolean>();

  @ViewChild('container')
  container: ElementRef;

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
    this.ngZone.runOutsideAngular(() => this._layoutHandler
      .handleCreate
      .pipe(
        takeUntil(this.destroy)
      )
      .subscribe(name => this.layout && this.layout.addComponent(name)));
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

    await this.layout.loadState(state);
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}

function isInput(element: Element): boolean {
  return element && element.tagName === 'INPUT';
}
