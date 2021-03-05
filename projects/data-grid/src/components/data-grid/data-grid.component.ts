import {
  AfterViewInit, ChangeDetectorRef, Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit, Output,
  ViewChild,
  ViewContainerRef,
  EventEmitter
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { Subject } from 'rxjs';
import { ICell } from '../../models';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';
import { CellClickDataGridHandler, DataGridHandler, Events } from './data-grid.handler';
import { NzContextMenuService } from 'ng-zorro-antd/dropdown';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';

declare function canvasDatagrid(params: any);

export const DefaultScrollSensetive = 1;

export interface DataGridItem {
  [key: string]: ICell;
}

interface GridStyles {
  font?: string;
  color?: string;
  background?: string;
  gridBorderColor?: string;
  scrollSensetive?: number;
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

  @ViewChild('menu') contextMenuComponent: NzDropdownMenuComponent;

  @Output() currentCellChanged = new EventEmitter();

  @Input()
  handlers: DataGridHandler[] = [];

  @Input() columns = [];
  @Input() afterDraw = (e, grid) => null;

  private _items: T[] = [];
  private _styles: GridStyles;

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

  @HostBinding('attr.title')
  title: string;

  // private _subscribedEvents = [];

  public isVisible = false;

  public rowHeight = 19;

  public list: TransferItem[] = [];

  public onDestroy$ = new Subject();

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
    private nzContextMenuService: NzContextMenuService,
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
        // font,
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
      parentNode: this.tableContainer.nativeElement,
      schema: this.columns,
      style: {
        font,
        color: cellColor,
        background: cellBackgroundColor,
        columnHeaderCellFont: '11px Open Sans',
        // columnHeaderCellColor: 'red',
        columnHeaderCellColor: '#A1A2A5',
        gridBorderColor: cellBorderColor,
        scrollBarBackgroundColor: cellBackgroundColor,
        scrollBarBoxColor: '#383A40',
        rowHeight: this.rowHeight,
        overflowY: 'hidden',
        overflowX: 'hidden',
        scrollSensetive: DefaultScrollSensetive,
        ...this._styles,
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
    // grid.addEventListener('beforerendercell', this.beforeRenderCell);
    // grid.addEventListener('rendercell', this.renderCell)
    // grid.addEventListener('afterrendercell', this.afterRenderCell)
    // grid.addEventListener('rendertext', this.renderText)
    grid.addEventListener('afterdraw', this._afterDraw);
    grid.addEventListener('currentCellChanged', this._currentCellChanged);
    grid.addEventListener('click', this._handleClick);
    grid.addEventListener('contextmenu', this._handleContextmenu);
    grid.addEventListener('mousedown', this._handleMouseDown);
    grid.addEventListener('mouseup', this._handleMouseUp);

    // grid.addEventListener('afterrendercell', afterRenderCell);

    this._grid = grid;
  }

  applyStyles(styles: GridStyles) {
    const grid = this._grid;
    this._styles = styles;

    if (!grid)
      return;

    grid.style = { ...styles }

    this.detectChanges(true);
  }

  detectChanges(force = false) {
    const grid = this._grid;

    if (grid)
      grid.draw(force);
  }

  ngAfterViewInit(): void {
    // this._handlers = this.initHandlers() || [];
    // for (const handler of this._handlers) {
    //   handler.events.forEach(e => this._subscribeOnEvents(e));
    // }
  }

  // initHandlers(): IHandler[] {
  //   const handlers = [];

  //   if (!Array.isArray(this.handlers))
  //     this.handlers = [];

  //   this.handlers.forEach(h => h.dataGrid = this);

  //   return [
  //     ...this.handlers.map(h => h.tableHandler),
  //     ...handlers
  //   ];
  // }

  createComponentModal($event): void {
    $event.preventDefault();
    this.nzContextMenuService.create($event, this.contextMenuComponent);
  }

  _handleMouseUp = (e) => {
    this._triggerHandler(Events.MouseUp, { ...e, column: e.cell?.column, row: e.cell?.row });
  }

  private _handleMouseDown = (e) => {
    this._triggerHandler(Events.MouseDown, { ...e, column: e.cell?.column, row: e.cell?.row });
  }

  private _handleContextmenu = (e) => {
    if (e?.e)
      e.e.preventDefault();

    this._triggerHandler(Events.ContextMenu, e);
  }

  private _handleClick = (e) => {
    this._triggerHandler(Events.Click, e);
  }

  private _triggerHandler(event, e) {
    const _handlers: CellClickDataGridHandler<any>[] = this.handlers as any;

    if (!Array.isArray(_handlers))
      return;

    for (const handler of _handlers as any[]) {
      if (handler.event != event || handler.column != e.column?.name)
        continue;

      const item = e.row;

      if (item)
        handler.notify(item);
    }
  }

  private _currentCellChanged = (e) => {
    this.currentCellChanged.emit(e);
    this.title = e?.item?.toString() ?? '';
  }

  private _afterDraw = (e) => {
    this.afterDraw(e, this._grid);
  }

  // private _handleEvent = (event) => {
  //   if (!this._handlers)
  //     return;

  //   for (const handler of this._handlers) {
  //     if (handler.events.some(e => e === 'click') && handler.handleEvent(event))
  //       return null;
  //   }
  // }

  // private _subscribeOnEvents(event: Events) {
  //   const element = this.tableContainer && this.tableContainer.nativeElement;
  //   if (!element)
  //     return;

  //   if (this._subscribedEvents.every(e => e !== event)) {
  //     this._subscribedEvents.push(event);
  //     const fn = (evt: Event) => this._handleEvent(evt);

  //     element.addEventListener(event, fn);
  //     this.onDestroy$.subscribe(() => element && element.removeEventListener(event, fn));
  //   }
  // }

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
      const grid = this._grid;
      grid.removeEventListener('afterdraw', this._afterDraw);
      grid.removeEventListener('currentCellChanged', this._currentCellChanged);
      grid.removeEventListener('click', this._handleClick);
      grid.removeEventListener('contextmenu', this._handleContextmenu);
      grid.removeEventListener('mousedown', this._handleMouseDown);
      grid.removeEventListener('mouseup', this._handleMouseUp);
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
