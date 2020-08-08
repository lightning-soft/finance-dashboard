import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ICell } from '../../models/cell';
import { DataGridScroll } from '../data-grid.scroll';
import { HorizontalDraggableDimensions } from '../horizontal-draggable';

const DEFAULT_MAX_WIDTH = 400,
  DEFAULT_MIN_WIDTH = 20,
  DEFAULT_WIDTH = 100;

interface ColumnInfo {
  width: number;
  grips: HorizontalDraggableDimensions;
}

export interface DataGridItem {
  [key: string]: ICell;

  selected: any;
}

@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.scss'],
})
export class DataGrid<T extends DataGridItem = any> implements OnInit, DoCheck, OnDestroy {
  // unsubscribeOnDestroy: UnsubscribeDestroyFunction;
  // onDestroy: Subject<any>;
  rowHeight = 38;
  columnsInfo: { [index: number]: ColumnInfo } = {};

  scrolledRows = 0;

  visibleRows = 0;

  private _columns = [];

  private _listeners: (() => void)[] = [];

  private _prevItemsCount: number;
  // private _selectHandler = new SelectHandler(this);

  // get allowSelect(): boolean {
  //   return this._selectHandler.selectable;
  // }

  // @Input()
  // set allowSelect(value: boolean) {
  //   this._selectHandler.selectable = value;
  // }

  // @Input()
  // contextMenu: ContextMenu;

  // @Input()
  // handlers: DataGridHandler[] = [];

  private _touchStartPosition: { x: number, y: number };

  get columns(): any[] {
    return this._columns;
  }

  @Input()
  translateSuffix = '';

  @Input()
  set columns(columns: any[]) {
    this._columns = columns;
  }

  @Output()
  selectedItemsChange = new EventEmitter();

  @ViewChild('tableContainer')
  tableContainer: ElementRef;

  @Input()
  allowVerticalScroll = true;

  private _scroll: ElementRef;

  @ViewChild('scroll')
  private set scroll(value: ElementRef) {
    this._scroll = value;
    this.dataGridScroll._scroll = value;
    if (value)
      this._subscribeOnScrollEvents();
  }

  private get scroll() {
    return this.allowVerticalScroll && this._scroll;
  }

  private _fakeContainer: ElementRef;

  get fakeContainer(): ElementRef {
    return this._fakeContainer;
  }

  @ViewChild('fakeContainer')
  set fakeContainer(value: ElementRef) {
    this._fakeContainer = value;
    if (value)
      this._updateScrollHeight();
  }

  @Input()
  loading: boolean;

  @Input()
  minWidth = DEFAULT_MIN_WIDTH;

  @Input()
  maxWidth = DEFAULT_MAX_WIDTH;

  @Input()
  defaultWidth = DEFAULT_WIDTH;

  get itemsCount() {
    return this.items ? this.items.length + 1 : 0; // 1 - header
  }

  rows: number[] = [];

  @Input()
  items: T[];

  // @HostBinding('class.phone')
  // isPhone = Environment.isPhone;

  // private _handlers: IHandler[] = [];

  private _subscribedEvents = [];

  dataGridScroll = new DataGridScroll(this.scroll);

  constructor(private _ngZone: NgZone,
    private _renderer: Renderer2,
    // private _contextMenuTrigger: ContextMenuTrigger,
    private _injector: Injector,
    // private _layoutNodeEventsProvider: LayoutNodeProvider
  ) {

  }

  //#region lifecycle

  ngOnInit(): void {
    const defaultWidth = this.defaultWidth,
      columns = this._columns;
    // ,
    // layoutNode = this._injector.get(this._layoutNodeEventsProvider && this._layoutNodeEventsProvider.component);

    for (let i = 0; i < columns.length; i++)
      this.columnsInfo[i] = {
        width: defaultWidth,
        grips: {
          minLeft: i * defaultWidth + this.minWidth,
          maxLeft: this.maxWidth && i * defaultWidth + this.maxWidth,
          left: (i + 1) * defaultWidth,
        },
      };

    // if (layoutNode)
    //   this.unsubscribeOnDestroy(layoutNode.events.subscribe(e => this._handleLayoutNodeEvent(e)));

    // this._handlers = this.initHandlers() || [];
    // for (let handler of this._handlers) {
    //   handler.events.forEach(e => this._subscribeOnEvents(e));
    // }
  }

  private _subscribeOnScrollEvents() {
    this._ngZone.runOutsideAngular(() => {
      let { tableContainer, scroll, _renderer } = this,
        scrollElement = scroll && scroll.nativeElement,
        element = tableContainer && tableContainer.nativeElement;

      if (!element || !scrollElement)
        return;

      this._listeners = [
        // Special solution for Mobile
        _renderer.listen(element, 'touchstart', (event) => this._canScrollFromTouch(event) && this._setTouchStartPosition(event)),
        _renderer.listen(element, 'touchmove', (event) => this._canScrollFromTouch(event) && this._handleTouchMove(event)),
        _renderer.listen(element, 'wheel', (event: WheelEvent) => {
          if (!event.shiftKey)
            this._scrollVertical(event.deltaY, 0.1);
        }),
      ];
    });
  }

  private _handleTouchMove(event) {
    let startPosition = this._touchStartPosition,
      touch = event.touches[0];

    if (!startPosition || !touch)
      return;

    if (Math.abs(touch.clientY - startPosition.y) > 2)
      this._scrollVertical(touch.clientY > startPosition.y ? -1 : 1, 0.04);

    // if (Environment.isIOS) {
    this._scrollHorizontal(startPosition.x - event.touches[0].clientX);
    event.preventDefault();
    // }

    this._setTouchStartPosition(event);
  }

  private _canScrollFromTouch(event): boolean {
    return event.srcElement.classList.contains('grips') === false;
  }

  private _scrollVertical(delta: number, multiplier: number) {
    let { scroll } = this,
      scrollElement = scroll && scroll.nativeElement;

    if (scrollElement)
      scrollElement.scrollTop += scrollElement.clientHeight * multiplier * (delta > 0 ? 1 : -1);
  }

  private _scrollHorizontal(delta) {
    let { tableContainer } = this,
      table = tableContainer && tableContainer.nativeElement;

    table.scrollLeft += delta;
  }

  private _setTouchStartPosition(event) {
    const touch = event && event.touches[0];

    this._touchStartPosition = touch && { x: touch.clientX, y: touch.clientY };
  }

  // private _subscribeOnEvents(event: Events) {
  //   let element = this.tableContainer && this.tableContainer.nativeElement;

  //   if (!element)
  //     return;

  //   if (this._subscribedEvents.every(e => e !== event)) {
  //     this._subscribedEvents.push(event);
  //     let fn = (evt: Event) => this._handleEvent(evt);

  //     element.addEventListener(event, fn);
  //     this.onDestroy.subscribe(() => element && element.removeEventListener(event, fn));
  //   }
  // }

  ngDoCheck() {
    if (this._prevItemsCount != null && this._prevItemsCount === this.itemsCount)
      return;

    this._updateScrollHeight();

    this.handleScroll(this.scroll && this.scroll.nativeElement);

    this._prevItemsCount = this.itemsCount;
  }

  private _updateScrollHeight() {
    const { itemsCount, fakeContainer, rowHeight, tableContainer, scroll } = this;
    if (itemsCount == null || !fakeContainer || !tableContainer || !scroll)
      return;


    let multiplier = scroll.nativeElement.clientHeight / tableContainer.nativeElement.clientHeight;

    fakeContainer.nativeElement.style.height = `${(itemsCount + 1) * rowHeight * multiplier}px`;
  }

  //#endregion

  // initHandlers(): IHandler[] {
  //   const handlers = [];

  //   if (this.contextMenu)
  //     handlers.push(new ContextMenuHandler({ handler: (e) => this._contextMenuTrigger.show(e, this.contextMenu) }));

  //   if (!Array.isArray(this.handlers))
  //     this.handlers = [];

  //   this.handlers.forEach(h => h.dataGrid = this);

  //   return [
  //     this._selectHandler,
  //     ...this.handlers.map(h => h.tableHandler),
  //     ...handlers
  //   ];
  // }

  /**
   * @method selectedChange
   * Use in SelectHandler
   * */
  selectedChange(index: number) {
    this.selectedItemsChange.emit();
    let scrollElement = this.scroll && this.scroll.nativeElement,
      rows;

    if (index > this.scrolledRows + this.visibleRows - 2)
      rows = index - this.visibleRows + 2; // 2 - header + partial visible last row
    else if (index < this.scrolledRows)
      rows = index;

    if (rows == null)
      return;

    if (rows > this.items.length)
      rows = this.items.length;

    scrollElement.scrollTop = Math.ceil(rows < 0 ? 0 : rows / this.itemsCount * scrollElement.scrollHeight);
  }

  //#region events

  handleScroll(scrollElement) {
    const { rowHeight, rows, tableContainer, items, itemsCount } = this,
      bodyElement = tableContainer && tableContainer.nativeElement;

    if (scrollElement)
      this.scrolledRows = Math.floor(itemsCount * scrollElement.scrollTop / scrollElement.scrollHeight);
    else
      this.scrolledRows = 0;

    if (bodyElement)
      this.visibleRows = Math.ceil(bodyElement.clientHeight / rowHeight);
    else
      this.visibleRows = 0;

    rows.splice(0, rows.length);
    for (let i = this.scrolledRows; i < this.scrolledRows + this.visibleRows; i++)
      if (items[i] != null)
        rows.push(i);
  }

  handleDrag(columnIndex: number, right: number) {
    let { columns, columnsInfo } = this,
      prevColumnLeft = columnIndex > 0 ? this.columnsInfo[columnIndex - 1].grips.left : 0,
      width = right - prevColumnLeft;

    if (width < 4)
      width = 4;

    columnsInfo[columnIndex].width = width;

    for (let i = columnIndex; i < columns.length; i++) {
      columnsInfo[i].grips.left = prevColumnLeft + columnsInfo[i].width;
      columnsInfo[i].grips.minLeft = prevColumnLeft + this.minWidth;
      columnsInfo[i].grips.maxLeft = this.maxWidth && prevColumnLeft + this.maxWidth;

      prevColumnLeft += columnsInfo[i].width;
    }
  }

  // private _handleLayoutNodeEvent(event) {
  //   if ((event === LayoutNodeEvent.Resize || event === LayoutNodeEvent.Show)) {
  //     setTimeout(() => {
  //       this._updateScrollHeight();
  //       this.handleScroll(this.scroll && this.scroll.nativeElement);
  //     });
  //   }

  //   this._handleEvent(event);
  // }

  // private _handleEvent(event) {
  //   if (!this._handlers)
  //     return;

  //   for (let handler of this._handlers) {
  //     if (handler.events.some(e => e === event.type) && handler.handleEvent(event))
  //       return null;
  //   }
  // }

  ngOnDestroy(): void {
    if (!Array.isArray(this._listeners))
      return;

    for (let listener of this._listeners)
      listener();
  }

  //#endregion

  trackByFn(index) {
    return index;
  }

  // select(number: number) {
  //   this._selectHandler._select(number, false);
  // }
}
