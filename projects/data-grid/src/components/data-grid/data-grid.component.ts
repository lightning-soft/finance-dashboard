import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { Subject } from 'rxjs';
import { Cell, ICell } from '../../models';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';
import { CellClickDataGridHandler, DataGridHandler, Events, HandlerEventData } from './data-grid.handler';
import { Column } from '../types';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { TextAlign } from 'dynamic-form';

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

export interface DataGridState {
  columns: any;
  contextMenuState: {
    showColumnHeaders: boolean;
    showHeaderPanel: boolean;
  };
}

export interface ICellChangedEvent<T> {
  column: Column;
  row: T;
  item: Cell;
  context: string;
  ctx: CanvasRenderingContext2D;
  dragContext: "cell"
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

  @HostBinding('attr.title') title: string;

  @Output() currentCellChanged = new EventEmitter<ICellChangedEvent<T>>();
  @Output() settingsClicked = new EventEmitter();
  @Output() columnUpdate = new EventEmitter<Column>();

  @Input() handlers: DataGridHandler[] = [];
  @Input() showContextMenuSettings = true;
  @Input() showHeaderPanelInContextMenu = false;
  @Input() showHeaderPanel = true;
  @Input() columns: Column[] = [];
  @Input() showSettingsInContextMenu = false;
  @Input() detach = false;
  @Input() afterDraw = (e, grid) => null;
  @Input() showColumnTitleOnHover: (column: Column) => boolean = () => true;

  private _items: T[] = [];
  private _styles: GridStyles;
  private _alignOptions = [TextAlign.Left, TextAlign.Right, TextAlign.Center];
  private _prevActiveCell: Cell;

  // private _subscribedEvents = [];

  public rowHeight = 19;
  public list: TransferItem[] = [];
  public onDestroy$ = new Subject();
  _grid: any;

  @Input()
  set items(value: T[]) {
    this._items = value;
    if (this._grid)
      this._grid.data = value;
  }

  get items(): T[] {
    if (!this._grid)
      return [];

    return this._grid.data;
  }


  get scrollHeight() {
    return this._grid.scrollHeight;
  }

  get scrollTop() {
    return this._grid.scrollTop;
  }

  set scrollTop(value: number) {
    this._grid.scrollTop = value;
  }

  private _contextMenuState = {
    showHeaderPanel: true,
    showColumnHeaders: true,
  };

  @Input() set contextMenuState(value) {
    if (value)
      this._contextMenuState = value;
  }

  get contextMenuState() {
    return this._contextMenuState;
  }

  @Output()
  contextMenuStateChange = new EventEmitter<any>();

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public _cd: ChangeDetectorRef,
    private container: ElementRef,
    private nzContextMenuService: NzContextMenuService,
  ) {
  }

  ngOnInit(): void {
    // this.activeColumns = this.columns.filter((column: Column) => column.visible);
    if (this.detach)
      this._cd.detach();
    const cellBorderColor = '#24262C';
    const cellBackgroundColor = '#1B1D22';
    const cellColor = '#D0D0D2';
    const font = '14px Open Sans';
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
      };

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
    grid.attributes.showColumnHeaders = this.contextMenuState.showColumnHeaders;
    grid.attributes.snapToRow = true;
    grid.attributes.columnHeaderClickBehavior = 'none';
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

    grid.style = { ...styles };

    this.detectChanges(true);
  }

  detectChanges(force = false) {
    const grid = this._grid;

    if (grid)
      grid.draw(force);
  }

  ngAfterViewInit(): void {
    // this._cd.detectChanges(); // update ViewChild decorator if detach attribute

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
  saveState(): DataGridState {
    return {
      columns: this._grid.schema,
      contextMenuState: this.contextMenuState,
    };
  }

  createComponentModal($event: MouseEvent): void {
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
    if (e?.e) {
      e.e.preventDefault();
    }
    this._triggerHandler(Events.ContextMenu, e);
    if (e?.e && this.showContextMenuSettings && !this.hasHandlers(Events.ContextMenu, e.column?.name)) {
      this.createComponentModal(e.e);
    }
  }

  private hasHandlers(eventType: Events, column: string) {
    if (column)
      return this.handlers.some(item => item.event === eventType && item['column'] === column);
  }

  private _handleClick = (e) => {
    this._triggerHandler(Events.Click, e);
  }

  private _triggerHandler(event: Events, e) {
    const _handlers: CellClickDataGridHandler<any>[] = this.handlers as any;

    if (!Array.isArray(_handlers))
      return;

    for (const handler of _handlers as any[]) {
      const columns: string[] = Array.isArray(handler.column) ? handler.column : [handler.column];
      if (handler.event != event || (handler.column && columns.every(i => i !== e.column?.name)))
        continue;

      const item = e.row;

      if (item || handler.handleHeaderClick)
        handler.notify(item, {event: e.e, column: e.column} as HandlerEventData);
    }
  }

  private _currentCellChanged = (event: ICellChangedEvent<T>) => {
    this.title = this.showColumnTitleOnHover(event.column) ? (event?.item?.toString() ?? '') : null;
    this.currentCellChanged.emit(event);
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

  toggleColumns(): void {
    this.contextMenuState.showColumnHeaders = !this._grid.attributes.showColumnHeaders;
    this._grid.attributes.showColumnHeaders = !this._grid.attributes.showColumnHeaders;
    this.detectChanges(true);
  }

  setFitColumnsWidth(): void {
    this.columns.forEach(column => {
      this._grid.fitColumnToValues(column);
    });
  }

  changeShowPanel($event: boolean) {
    this.contextMenuState.showHeaderPanel = $event;
  }

  onSettingsClicked() {
    this.settingsClicked.next();
  }

  changeColumnVisibility(item: any, value: boolean) {
    item.visible = value;
    this.columnUpdate.emit(item);
    this.detectChanges(true);
  }

  changeAlign(item: any) {
    const index = this._alignOptions.indexOf(item.style.textAlign) + 1;
    item.style.textAlign = this._alignOptions[index % this._alignOptions.length];
    this.columnUpdate.emit(item);
    this.detectChanges(true);
  }

  getShownColumns() {
    return this.columns.filter(item => !item.hidden);
  }

  getColumnName(item: Column) {
    if (item.tableViewName)
      return item.tableViewName;
    return item.title ?? item.name;
  }
}
