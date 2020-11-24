import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { NzModalService } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { Subject } from 'rxjs';
import { ICell } from '../../models';
import { IconComponent, iconComponentSelector } from '../../models/cells/components/icon-conponent';
import { PriceComponent, priceComponentSelector } from '../../models/cells/components/price-component';
import { ModalComponent } from '../modal/modal.component';
import { Column } from '../types';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';

import {
  DataGridHandler,
  Events,
  IHandler
} from './data-grid.handler';

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
      [iconComponentSelector]: IconComponent,
      [priceComponentSelector]: PriceComponent,
    })
  }]
})
export class DataGrid<T extends DataGridItem = any> implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('tableContainer') tableContainer: ElementRef;

  @ViewChild(ModalComponent)
  modalComponent: ModalComponent;

  @ViewChild(CdkVirtualScrollViewport)
  public viewPort: CdkVirtualScrollViewport | any;

  @Input()
  handlers: DataGridHandler[] = [];

  @Input() columns = [];
  @Input() items: T[];

  public activeColumns: Column[] = [];

  private _handlers = [];
  private _subscribedEvents = [];

  public isVisible = false;
  public rowHeight = 35;

  public list: TransferItem[] = [];

  public onDestroy$ = new Subject();

  get inverseTranslation(): string {
    if (!this.viewPort || !this.viewPort._renderedContentOffset) {
      return '-0px';
    }

    const offset = this.viewPort._renderedContentOffset + 1;
    return `-${offset}px`;
  }

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this.activeColumns = this.columns.filter((column: Column) => column.visible);
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

  createComponentModal(): void {
    const modal = this.modalService.create({
      nzTitle: 'Columns',
      nzContent: ModalComponent,
      nzWrapClassName: 'modal-data-grid',
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        columns: [...this.columns],
      },
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.columns = [...result];
        this.activeColumns = this.columns.filter((column: Column) => column.visible);
      }
    });
  }

  layout() {
    this.viewPort.checkViewportSize();
  }

  trackByFn(item) {
    return item.id;
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

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
