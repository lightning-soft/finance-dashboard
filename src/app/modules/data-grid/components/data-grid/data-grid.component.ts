import {
  AfterViewInit,
  Component, ElementRef, HostBinding,
  Input, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { ICell } from '../../models';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';
import { IconComponent, iconComponentSelector } from '../../models/cells/components/icon-conponent';
import { DataGridHandler, Events, IHandler } from './data-grid.handler';
import { Subject } from 'rxjs';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { ModalComponent } from '../modal/modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';

export interface DataGridItem {
  [key: string]: ICell;
}

@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.scss'],
  providers: [{
    provide: IViewBuilderStore,
    useValue: new ViewBuilderStore({
      [iconComponentSelector]: IconComponent
    })
  }]
})
export class DataGrid<T extends DataGridItem = any> implements AfterViewInit, OnDestroy {
  rowHeight = 35;
  list: TransferItem[] = [];
  onDestroy$ = new Subject();

  @ViewChild('tableContainer') tableContainer: ElementRef;
  @Input()
  handlers: DataGridHandler[] = [];
  @ViewChild(ModalComponent) modalComponent: ModalComponent;
  @ViewChild(CdkVirtualScrollViewport)
  public viewPort: CdkVirtualScrollViewport | any;
  @Input() columns = [];
  @Input()
  items: T[];
  private _handlers = [];

  private _subscribedEvents = [];
  isVisible = false;

  constructor(private modalService: NzModalService,
              private viewContainerRef: ViewContainerRef) {
  }

  createComponentModal(): void {
    const modal = this.modalService.create({
      nzTitle: 'Select options',
      nzContent: ModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        columns: this.columns
      },
    });
    const instance = modal.getContentComponent();
    modal.afterOpen.subscribe((def) => console.log('[afterOpen] emitted!'));
    // Return a result when closed
    modal.afterClose.subscribe(result => this.columns = result);
  }
  ngAfterViewInit(): void {
    this._handlers = this.initHandlers() || [];
    for (const handler of this._handlers) {
      handler.events.forEach(e => this._subscribeOnEvents(e));
    }
  }

  initHandlers(): IHandler[] {
    const handlers = [];

    if (!Array.isArray(this.handlers))
      this.handlers = [];

    this.handlers.forEach(h => h.dataGrid = this);

    return [
      ...this.handlers.map(h => h.tableHandler),
      ...handlers
    ];
  }

  trackByFn(item) {
    return item.id;
  }

  get inverseTranslation(): string {
    if (!this.viewPort || !this.viewPort._renderedContentOffset) {
      return '-0px';
    }

    const offset = this.viewPort._renderedContentOffset + 1;
    return `-${offset}px`;
  }

  private _handleEvent(event) {
    if (!this._handlers)
      return;
    for (const handler of this._handlers) {
      if (handler.events.some(e => e === event.type) && handler.handleEvent(event))
        return null;
    }
  }

  private _subscribeOnEvents(event: Events) {
    const element = this.tableContainer && this.tableContainer.nativeElement;
    if (!element)
      return;

    if (this._subscribedEvents.every(e => e !== event)) {
      this._subscribedEvents.push(event);
      const fn = (evt: Event) => this._handleEvent(evt);

      element.addEventListener(event, fn);
      this.onDestroy$.subscribe(() => element && element.removeEventListener(event, fn));
    }
  }

  layout() {
    this.viewPort.checkViewportSize();
    // this._changeDetector.detectChanges();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
