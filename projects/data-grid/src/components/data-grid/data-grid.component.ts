import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { TextAlign } from 'dynamic-form';
import * as clone from 'lodash.clonedeep';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { Subject } from 'rxjs';
import { Cell, ICell } from '../../models';
import { Column } from '../types';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';
import { CellClickDataGridHandler, DataGridHandler, Events, IHandlerData } from './data-grid.handler';

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
  gridBorderWidth?: number;
  gridHeaderBorderColor?: string;
  scrollSensetive?: number;
  rowHeight?: number;
  headerHeight?: number;
  rowOffset?: number;
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

let closePrevContextMenu: () => void;
export type CustomContextMenuItem = { title?: string, action?: () => void, divider?: boolean };

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

  @ViewChild('tableContainer', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;


  @HostBinding('attr.title') title: string;

  @Output() currentCellChanged = new EventEmitter<ICellChangedEvent<T>>();
  @Output() settingsClicked = new EventEmitter();
  @Output() columnUpdate = new EventEmitter<Column>();
  @Output() editFinished = new EventEmitter<Cell>();

  @Input() handlers: DataGridHandler[] = [];
  @Input() showContextMenuSettings = true;
  @Input() showHeaderPanelInContextMenu = false;
  @Input() showHeaderPanel = true;
  @Input() columns: Column[] = [];
  @Input() showSettingsInContextMenu = false;
  @Input() detach = false;
  @Input() afterDraw = (e, grid) => null;
  @Input() sizeChanged = (e) => null;
  @Input() onColumnResize = (e) => null;
  @Input() showColumnTitleOnHover: (column: Column) => boolean = () => true;
  @Input() styles: GridStyles;
  @Input() templatesEnabled = true;

  @Input() editComponentsFactory: Function;

  @Input() customMenuItems: CustomContextMenuItem[] = [];

  private _items: T[] = [];
  private _alignOptions = [TextAlign.Left, TextAlign.Right, TextAlign.Center];
  private _prevActiveCell: Cell;

  @Input() public rowHeight = 19;
  public list: TransferItem[] = [];
  public onDestroy$ = new Subject();
  _grid: any;

  editComponent;

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

  get isInitialized(): boolean {
    return this._grid != null;
  }


  get scrollHeight() {
    return this._grid.scrollHeight;
  }

  get scrollWidth() {
    return this._grid.scrollWidth;
  }

  get scrollTop() {
    return this._grid.scrollTop;
  }

  set scrollTop(value: number) {
    if (this._grid) {
      this._grid.scrollTop = value;
    }
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

  get currentCell() {
    return this._grid.currentCell;
  }

  @Output()
  contextMenuStateChange = new EventEmitter<any>();

  // presets
  @Input() loadedPresets = false;
  @Output() savePresets: EventEmitter<void> = new EventEmitter();
  @Output() createPresets: EventEmitter<void> = new EventEmitter();
  @Output() onOnitialized: EventEmitter<void> = new EventEmitter();

  constructor(
    public _cd: ChangeDetectorRef,
    private _zone: NgZone,
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
          color: '#0C62F7',
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
        ...this.styles,
      },
      data: [],
    });

    (window as any).grid = grid;

    grid.style.height = '100%';
    grid.style.width = '100%';
    grid.data = this._items;
    grid.scale = 2;
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
    grid.addEventListener('resize', this._handleResize);
    grid.addEventListener('resizecolumn', this._handleColumnResize);
    grid.addEventListener('beginEdit', this._beginEdit);
    grid.addEventListener('endEdit', this._endEdit);
    grid.addEventListener('resizeEditCell', this._resizeEdit);

    // grid.addEventListener('afterrendercell', afterRenderCell);

    this._grid = grid;
    this.onOnitialized.emit();
  }

  startEditingAt(x, y) {
    const cell = this._grid.getCellAt(x, y);
    if (cell)
      this._grid.beginEditAt(cell);
  }

  endEdit() {
    this._grid.endEdit();
  }

  applyStyles(styles: GridStyles) {
    const grid = this._grid;
    this.styles = styles;

    if (!grid)
      return;

    grid.style = { ...styles };

    this.detectChanges(true);
  }

  changeColumns(columns: Column[]) {
    this.columns = columns.map(item => {
      if (!item.width) {
        item.width = 100;
      }
      return item;
    });
    this._grid.schema = this.columns;
    this.detectChanges(true);
  }

  detectChanges(force = false) {
    const grid = this._grid;

    if (grid)
      grid.draw(force);
  }

  save(): void {
    this.savePresets.emit();
  }

  saveAs(): void {
    this.createPresets.emit();
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
      columns: clone(this._grid?.schema),
      contextMenuState: this.contextMenuState,
    };
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterHandler(event: KeyboardEvent) {
    this._grid.endEdit();
  }

  createComponentModal($event: MouseEvent): void {
    if (closePrevContextMenu) {
      closePrevContextMenu();
    }
    this._zone.run(() => {
      this.nzContextMenuService.create($event, this.contextMenuComponent);
      closePrevContextMenu = this.nzContextMenuService.close.bind(this.nzContextMenuService);
    });
  }

  _handleMouseUp = (e) => {
    this._triggerHandler(Events.MouseUp, { ...e, column: e.cell?.column, row: e.cell?.row });
  }

  _handleResize = (e) => {
    if (this.sizeChanged)
      this.sizeChanged(e);
  }

  _handleColumnResize = (e) => {
    if (this.onColumnResize)
      this.onColumnResize(e);
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

  private _beginEdit = (e) => {
    const editPayload = this.editComponentsFactory(e);

    if (!editPayload)
      return;

    const { factory, params, styles } = editPayload;
    const component = this.entry.createComponent(factory);
    this.editComponent = component;
    const style = component.location.nativeElement.style;
    style.position = 'absolute';
    for (let key in styles) {
      style[key] = styles[key];
    }

    for (let key in params) {
      component.instance[key] = params[key];
    }
  };

  private _resizeEdit = ({ position }) => {
    const children = this.tableContainer.nativeElement.parentNode.children;
    if (!children.length)
      return;

    const editView = children[children.length - 1];

    this._zone.run(() => {
      for (let key in position) {
        editView.style[key] = position[key];
      }
    });
  }
  private _endEdit = (e) => {
    if (e.item.editValueSetter) {
      e.item.editValueSetter(this.editComponent);
    }
    this.editFinished.emit(e);
    this.editComponent = null;

    this.entry.remove();
  };

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
        handler.notify({ column: e.column, item } as IHandlerData, e.e);
    }
  }

  private _currentCellChanged = (event: ICellChangedEvent<T>) => {
    // this.title = this.showColumnTitleOnHover(event.column) ? (event?.item?.toString() ?? '') : null;
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
      grid.removeEventListener('resize', this._handleResize);
      grid.removeEventListener('resizecolumn', this._handleColumnResize);
      grid.removeEventListener('beginEdit', this._beginEdit);
      grid.removeEventListener('endEdit', this._endEdit);
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  toggleColumns(): void {
    this.contextMenuState.showColumnHeaders = !this._grid.attributes.showColumnHeaders;
    this.contextMenuStateChange.emit(this.contextMenuState);
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
    this.contextMenuStateChange.emit(this.contextMenuState);
  }

  onSettingsClicked($event) {
    this.settingsClicked.next($event);
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
