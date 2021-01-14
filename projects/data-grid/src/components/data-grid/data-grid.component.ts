import {
  AfterViewInit, ChangeDetectorRef, Component,
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
import { ModalComponent } from '../modal/modal.component';
import { Column } from '../types';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';
import { DataGridHandler, Events, IHandler } from './data-grid.handler';


export interface DataGridItem {
  [key: string]: ICell;
}

@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.scss'],
  providers: [{
    provide: IViewBuilderStore,
    useClass: ViewBuilderStore,
  }]
})
export class DataGrid<T extends DataGridItem = any> implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('tableContainer') tableContainer: ElementRef;
  // @ViewChild('container', { read: ElementRef, static: true }) container: ElementRef;

  @ViewChild(ModalComponent)
  modalComponent: ModalComponent;

  @Input()
  handlers: DataGridHandler[] = [];

  @Input() columns = [];
  @Input() items: T[];
  @Input() detach: boolean = false;

  public activeColumns: Column[] = [];
  showHeaders = true;

  private _handlers = [];
  private _subscribedEvents = [];

  public isVisible = false;
  public rowHeight = 20;

  public list: TransferItem[] = [];

  public onDestroy$ = new Subject();

  get inverseTranslation() {
    return 0;
  }

  // get inverseTranslation(): string {
  //   // if (!this.viewPort || !this.viewPort._renderedContentOffset) {
  //   //   return '-0px';
  //   // }

  //   // const offset = this.viewPort._renderedContentOffset + 1;
  //   // return `-${offset}px`;
  // }

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public _cd: ChangeDetectorRef,
    private container: ElementRef
  ) { }

  ngOnInit(): void {
    this.activeColumns = this.columns.filter((column: Column) => column.visible);
    if (this.detach)
      this._cd.detach();
  }

  detectChanges() {
    this._cd.detectChanges();
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
      nzContent: ModalComponent,
      nzFooter: null,
      nzWrapClassName: 'modal-data-grid',
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        columns: [...this.columns],
        showHeaders: this.showHeaders,
      },
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.columns = result.columns;
        this.showHeaders = result.showHeaders;
        this.activeColumns = this.columns.filter((column: Column) => column.visible);
      }
    });
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

  getVisibleRows() {
    const bodyElement = this.container && this.container.nativeElement;
    return bodyElement ? Math.max(0, Math.ceil(bodyElement.clientHeight / this.rowHeight) - 1) : 0;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
