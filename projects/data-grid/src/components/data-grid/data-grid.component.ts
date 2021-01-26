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
import { NgZone } from '@angular/core';
import { styles } from '../../../../lazy-assets/src/config';

declare function canvasDatagrid(params: any);
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

  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;

  @ViewChild(ModalComponent)
  modalComponent: ModalComponent;

  @Input()
  handlers: DataGridHandler[] = [];

  @Input() columns = [];
  @Input() beforeRenderCell = (e) => null;
  @Input() renderCell = (e) => null;
  @Input() afterRenderCell = (e) => null;
  @Input() renderText = (e) => null;
  @Input() afterDraw = (grid) => null;

  private _items: T[] = [];

  get items(): T[] {
    if (!this._grid)
      return [];

    return this._grid.data;
  }

  @Input()
  set items(value: T[]) {
    this._items = value;
    if (this._grid)
      this._grid.data = value;
  }

  @Input() detach: boolean = false;

  // public activeColumns: Column[] = [];

  private _handlers = [];
  private _subscribedEvents = [];

  public isVisible = false;

  public rowHeight = 19;

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

  _grid: any;

  get scrollHeight() {
    return this._grid.scrollHeight;
  }

  get scrollTop() {
    return this._grid.scrollTop;
  }

  set scrollTop(value: number) {
    this._grid.scrollTop = value;
  }

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public _cd: ChangeDetectorRef,
    private container: ElementRef,
    private _zone: NgZone
  ) { }

  ngOnInit(): void {
    // this.activeColumns = this.columns.filter((column: Column) => column.visible);
    if (this.detach)
      this._cd.detach();
    const cellBorderColor = "#24262C";
    const cellBackgroundColor = '#1B1D22';
    const cellColor = '#D0D0D2';
    const font = "14px Open Sans";
    // const horizontalAlignment = "center";

    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      column.style = {
        // background: 'grey',
        histogram: {
          color: '#4895F5',
          enabled: true,
          orientation: 'left',
        },
        color: cellColor,
        font,
        textAlign: 'center',
        ...column.style,
      }

      if (!column.width)
        column.width = 100;
    }

    const grid = canvasDatagrid({
      allowColumnResize: true,
      allowColumnReordering: true,
      allowRowResize: false,
      autoResizeRows: false,
      editable: false,
      // showPerformance: true,
      parentNode: this.tableContainer.nativeElement,
      schema: this.columns,
      style: {
        font,
        color: cellColor,
        background: cellBackgroundColor,
        gridBorderColor: cellBorderColor,
        rowHeight: this.rowHeight,
        // cellHeight:
      },
      data: [],
    });

    (window as any).grid = grid;

    grid.style.height = '100%';
    grid.style.width = '100%';
    grid.data = this._items;
    grid.attributes.allowSorting = false;
    grid.attributes.showRowHeaders = false;
    grid.attributes.showColumnHeaders = true;
    grid.attributes.snapToRow = true;
    grid.attributes.columnHeaderClickBehavior = 'none'

    // grid.applyComponentStyle();
    grid.addEventListener('beforerendercell', this.beforeRenderCell);
    grid.addEventListener('rendercell', this.renderCell)
    grid.addEventListener('afterrendercell', this.afterRenderCell)
    grid.addEventListener('rendertext', this.renderText)
    grid.addEventListener('afterdraw', this.afterDraw)
    grid.addEventListener('click', this._handleClick);
    // grid.addEventListener('afterrendercell', afterRenderCell);

    this._grid = grid;
  }

  detectChanges(force = false) {
    const grid = this._grid;

    if (grid)
      grid.draw(force);
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
        // this.columns = [...result];
        // this.activeColumns = this.columns.filter((column: Column) => column.visible);
      }
    });
  }

  trackByFn(item) {
    return item.id;
  }

  private _handleClick(e) {
    const cell = e.cell;
    console.log(cell.rowIndex, cell.columnIndex)
  }

  private _handleEvent = (event) => {
    if (!this._handlers)
      return;

    for (const handler of this._handlers) {
      if (handler.events.some(e => e === 'click') && handler.handleEvent(event))
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

  resize() {
    if (this._grid)
      this._grid.resize(true);
  }

  scrollTo(px: number) {
    this._grid.scrollTo(px);
  }

  ngOnDestroy(): void {
    if (this._grid) {
      this._grid.removeEventListener('rendercell', this.renderCell)
      // this._grid.removeEventListener('afterrendercell', afterRenderCell);
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
