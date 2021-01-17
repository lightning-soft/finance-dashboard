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

declare function canvasDatagrid(params: any);
export interface DataGridItem {
  [key: string]: ICell;
}

function afterRenderCell(e) {
}

function renderCell(e) {
  const ctx = e.ctx;
  const cell = e.cell.value;

  if (!cell?.component)
    return;

  switch (cell.component) {
    case 'histogram-component':

      break;
  }


  // console.log(e.header.name, cell.name, JSON.stringify(cell.settings));
  // const color = cell.settings.backgroundColor;
  // e.ctx.fillStyle = cell.settings.backgroundColor ?? '#1b1d22';
  // if (cell.value) return;

  // var g,
  //   gb,
  //   x = 0,
  //   d = +(cell.value[0] - cell.value[1]).toFixed(2),
  //   m = Math.max.apply(null, cell.value),
  //   a = cell.value.reduce(function (ac, c) { return ac + c; }, 0) / cell.value.length,
  //   i = Math.min.apply(null, cell.value),
  //   w = cell.width / cell.value.length,
  //   ar = (d > 0 ? '\u25BC' : '\u25B2'),
  //   r = cell.height / (m - (m * 0.1));

  // function line(n, c) {
  //   ctx.beginPath();
  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = c;
  //   ctx.moveTo(cell.x, cell.y + (n * r));
  //   ctx.lineTo(cell.x + cell.width, cell.y + (n * r));
  //   ctx.stroke();
  // }

  // ctx.save();
  // gb = ctx.createLinearGradient((cell.x + cell.width) / 2, cell.y, (cell.x + cell.width) / 2, cell.y + cell.height);
  // gb.addColorStop(0, '#0C4B73');
  // gb.addColorStop(1, (cell.selected || cell.active) ? '#B3C3CC' : '#041724');
  // ctx.fillStyle = gb;
  // ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
  // ctx.beginPath();
  // ctx.moveTo(cell.x, cell.y + cell.height);
  // cell.value.forEach(function (d) {
  //   var cx = cell.x + w + x,
  //     cy = cell.y + (d * r);
  //   ctx.lineTo(cx, cy);
  //   if (d === i || d === m) {
  //     ctx.fillStyle = d === m ? 'green' : 'red';
  //     ctx.fillRect(cx - 2, cy - 2, 5, 5);
  //   }
  //   x += w;
  // });
  // ctx.lineTo(cell.x + cell.width, cell.y + cell.height);
  // g = ctx.createLinearGradient((cell.x + cell.width) / 2, cell.y, (cell.x + cell.width) / 2, cell.y + cell.height);
  // g.addColorStop(0, '#0F5C8C');
  // g.addColorStop(1, '#499ABA');
  // ctx.fillStyle = g;
  // ctx.fill();
  // ctx.strokeStyle = '#0B466B';
  // ctx.stroke();
  // line(a, d >= 0 ? 'green' : 'red');
  // cell.parentGrid.data[cell.rowIndex].col1 = (d === 0 ? ' ' : ar) + ' Diff: ' + d
  //   + 'Avg:' + a.toFixed(2) + '\nMin: ' + i.toFixed(2) + '\nMax: ' + m.toFixed(2);
  // ctx.restore();
}

@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.scss'],
  // providers: [{
  //   provide: IViewBuilderStore,
  //   useClass: ViewBuilderStore,
  // }]
})
export class DataGrid<T extends DataGridItem = any> implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;
  // @ViewChild('container', { read: ElementRef, static: true }) container: ElementRef;

  @ViewChild(ModalComponent)
  modalComponent: ModalComponent;

  @Input()
  handlers: DataGridHandler[] = [];

  @Input() columns = [];
  @Input() renderCell = () => null;

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

  public activeColumns: Column[] = [];

  private _handlers = [];
  private _subscribedEvents = [];

  public isVisible = false;

  public rowHeight = 35;

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

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public _cd: ChangeDetectorRef,
    private container: ElementRef
  ) { }

  ngOnInit(): void {
    this.columns = this.columns.map(i => ({ ...i, width: 100 }));
    this.activeColumns = this.columns.filter((column: Column) => column.visible);
    if (this.detach)
      this._cd.detach();
    const cellBorderColor = "#24262C";
    const cellBackgroundColor = '#1B1D22';
    const cellColor = '#D0D0D2';

    const style = {
      cellBackgroundColor,
      cellColor,
      activeCellBackgroundColor: cellBackgroundColor,
      activeCellBorderColor: cellBorderColor,
      activeCellBorderWidth: 1,
      activeCellColor: cellColor,
      activeCellFont: "16px sans-serif",
      activeCellHoverBackgroundColor: cellBackgroundColor,
      activeCellHorizontalAlignment: "left",
      activeCellHoverColor: cellColor,
      activeCellOverlayBorderColor: cellBorderColor,
      activeCellOverlayBorderWidth: 1,
      activeCellPaddingBottom: 5,
      activeCellPaddingLeft: 5,
      activeCellPaddingRight: 5,
      activeCellPaddingTop: 5,
      activeCellSelectedBackgroundColor: cellBackgroundColor,
      activeCellSelectedColor: cellColor,
      activeCellVerticalAlignment: "center",
      activeColumnHeaderCellBackgroundColor: cellBackgroundColor,
      activeColumnHeaderCellColor: '#A1A2A5',
      activeRowHeaderCellBackgroundColor: cellBackgroundColor,
      activeRowHeaderCellColor: '#A1A2A5',
      autocompleteBottomMargin: 60,
      autosizeHeaderCellPadding: 8,
      autosizePadding: 5,
      cellAutoResizePadding: 13,
      cellBorderColor,
      cellBorderWidth: 1,
      cellFont: "16px sans-serif",
      cellGridHeight: 250,
      cellHeight: this.rowHeight,
      cellHeightWithChildGrid: 150,
      cellHorizontalAlignment: "left",
      cellHoverBackgroundColor: cellBackgroundColor,
      cellHoverColor: cellColor,
      cellPaddingBottom: 5,
      cellPaddingLeft: 5,
      cellPaddingRight: 5,
      cellPaddingTop: 5,
      cellSelectedBackgroundColor: cellBackgroundColor,
      cellSelectedColor: cellColor,
      cellVerticalAlignment: "center",
      cellWidth: 250,
      cellWidthWithChildGrid: 250,
      cellWhiteSpace: "nowrap",
      cellLineHeight: 1,
      cellLineSpacing: 3,
      childContextMenuArrowColor: cellBackgroundColor,
      childContextMenuArrowHTML: "&#x25BA;",
      childContextMenuMarginLeft: -11,
      childContextMenuMarginTop: -6,
      columnHeaderCellBackgroundColor: cellBackgroundColor,
      columnHeaderCellBorderColor: cellBorderColor,
      columnHeaderCellBorderWidth: 1,
      columnHeaderCellCapBackgroundColor: cellBackgroundColor,
      columnHeaderCellCapBorderColor: cellBorderColor,
      columnHeaderCellCapBorderWidth: 1,
      columnHeaderCellColor: '#A1A2A5',
      columnHeaderCellFont: "16px sans-serif",
      columnHeaderCellHeight: 25,
      columnHeaderCellHorizontalAlignment: "left",
      columnHeaderCellHoverBackgroundColor: cellBackgroundColor,
      columnHeaderCellHoverColor: cellColor,
      columnHeaderCellPaddingBottom: 5,
      columnHeaderCellPaddingLeft: 5,
      columnHeaderCellPaddingRight: 5,
      columnHeaderCellPaddingTop: 5,
      columnHeaderCellVerticalAlignment: "center",
      columnHeaderOrderByArrowBorderColor: cellBorderColor,
      columnHeaderOrderByArrowBorderWidth: 1,
      columnHeaderOrderByArrowColor: "rgba(155, 155, 155, 1)",
      columnHeaderOrderByArrowHeight: 8,
      columnHeaderOrderByArrowMarginLeft: 0,
      columnHeaderOrderByArrowMarginRight: 5,
      columnHeaderOrderByArrowMarginTop: 6,
      columnHeaderOrderByArrowWidth: 13,
      contextFilterButtonBorder: "solid 1px rgba(158, 163, 169, 1)",
      contextFilterButtonBorderRadius: "3px",
      contextFilterButtonHTML: "&#x25BC;",
      contextFilterInputBackground: "rgba(255,255,255,1)",
      contextFilterInputBorder: "solid 1px rgba(158, 163, 169, 1)",
      contextFilterInputBorderRadius: "0",
      contextFilterInputColor: "rgba(0,0,0,1)",
      contextFilterInputFontFamily: "sans-serif",
      contextFilterInputFontSize: "14px",
      contextFilterInvalidRegExpBackground: "rgba(180, 6, 1, 1)",
      contextFilterInvalidRegExpColor: "rgba(255, 255, 255, 1)",
      contextMenuArrowColor: "rgba(43, 48, 43, 1)",
      contextMenuArrowDownHTML: "&#x25BC;",
      contextMenuArrowUpHTML: "&#x25B2;",
      contextMenuBackground: cellBackgroundColor,
      contextMenuBorder: "solid 1px rgba(158, 163, 169, 1)",
      contextMenuBorderRadius: "3px",
      contextMenuChildArrowFontSize: "12px",
      contextMenuColor: cellColor,
      contextMenuCursor: "default",
      contextMenuFilterButtonFontFamily: "sans-serif",
      contextMenuFilterButtonFontSize: "10px",
      contextMenuFilterInvalidExpresion: "rgba(237, 155, 156, 1)",
      contextMenuFontFamily: "sans-serif",
      contextMenuFontSize: "16px",
      contextMenuHoverBackground: "rgba(182, 205, 250, 1)",
      contextMenuHoverColor: "rgba(43, 48, 153, 1)",
      contextMenuItemBorderRadius: "3px",
      contextMenuItemMargin: "2px",
      contextMenuLabelDisplay: "inline-block",
      contextMenuLabelMargin: "0 3px 0 0",
      contextMenuLabelMaxWidth: "700px",
      contextMenuLabelMinWidth: "75px",
      contextMenuMarginLeft: 3,
      contextMenuMarginTop: -3,
      contextMenuOpacity: "0.98",
      contextMenuPadding: "2px",
      contextMenuWindowMargin: 30,
      contextMenuZIndex: 10000,
      cornerCellBackgroundColor: cellBackgroundColor,
      cornerCellBorderColor: cellBorderColor,
      debugBackgroundColor: "rgba(0, 0, 0, .0)",
      debugColor: "rgba(255, 15, 24, 1)",
      debugEntitiesColor: "rgba(76, 231, 239, 1.00)",
      debugFont: "11px sans-serif",
      debugPerfChartBackground: "rgba(29, 25, 26, 1.00)",
      debugPerfChartTextColor: "rgba(255, 255, 255, 0.8)",
      debugPerformanceColor: "rgba(252, 255, 37, 1.00)",
      debugScrollHeightColor: "rgba(248, 33, 103, 1.00)",
      debugScrollWidthColor: "rgba(66, 255, 27, 1.00)",
      debugTouchPPSXColor: "rgba(246, 102, 24, 1.00)",
      debugTouchPPSYColor: "rgba(186, 0, 255, 1.00)",
      display: "inline",
      editCellBackgroundColor: "white",
      editCellBorder: "solid 1px rgba(110, 168, 255, 1)",
      editCellBoxShadow: "0 2px 5px rgba(0,0,0,0.4)",
      editCellColor: "black",
      editCellFontFamily: "sans-serif",
      editCellFontSize: "16px",
      editCellPaddingLeft: 4,
      editCellZIndex: 10000,
      frozenMarkerHoverColor: "rgba(236, 243, 255, 1)",
      frozenMarkerHoverBorderColor: "rgba(110, 168, 255, 1)",
      frozenMarkerActiveColor: "rgba(236, 243, 255, 1)",
      frozenMarkerActiveBorderColor: "rgba(110, 168, 255, 1)",
      frozenMarkerColor: "rgba(222, 222, 222, 1)",
      frozenMarkerBorderColor: "rgba(168, 168, 168, 1)",
      frozenMarkerBorderWidth: 1,
      frozenMarkerWidth: 2,
      gridBackgroundColor: cellBackgroundColor,
      gridBorderCollapse: "collapse",
      gridBorderColor: cellBorderColor,
      gridBorderWidth: 1,
      height: "100%",
      maxHeight: "none",
      maxWidth: "none",
      minColumnWidth: 45,
      minHeight: "0px",
      minRowHeight: this.rowHeight,
      minWidth: "0px",
      mobileContextMenuMargin: 10,
      mobileEditInputHeight: 30,
      mobileEditFontFamily: "sans-serif",
      mobileEditFontSize: "16px",
      moveOverlayBorderWidth: 1,
      moveOverlayBorderColor: "rgba(66, 133, 244, 1)",
      moveOverlayBorderSegments: [12, 7],
      name: "default",
      overflowY: "hidden",
      overflowX: "hidden",
      reorderMarkerBackgroundColor: "rgba(0, 0, 0, 0.1)",
      reorderMarkerBorderColor: "rgba(0, 0, 0, 0.2)",
      reorderMarkerBorderWidth: 1.25,
      reorderMarkerIndexBorderColor: "rgba(66, 133, 244, 1)",
      reorderMarkerIndexBorderWidth: 2.75,
      rowHeaderCellBackgroundColor: cellBackgroundColor,
      rowHeaderCellBorderColor: cellBorderColor,
      rowHeaderCellBorderWidth: 1,
      rowHeaderCellColor: '#A1A2A5',
      rowHeaderCellFont: "16px sans-serif",
      rowHeaderCellHeight: this.rowHeight,
      rowHeaderCellHorizontalAlignment: "left",
      rowHeaderCellHoverBackgroundColor: cellBackgroundColor,
      rowHeaderCellHoverColor: '#A1A2A5',
      rowHeaderCellPaddingBottom: 5,
      rowHeaderCellPaddingLeft: 5,
      rowHeaderCellPaddingRight: 5,
      rowHeaderCellPaddingTop: 5,
      rowHeaderCellSelectedBackgroundColor: cellBackgroundColor,
      rowHeaderCellSelectedColor: cellColor,
      rowHeaderCellVerticalAlignment: "center",
      rowHeaderCellWidth: 57,
      scrollBarActiveColor: "rgba(125, 125, 125, 1)",
      scrollBarBackgroundColor: "rgba(240, 240, 240, 1)",
      scrollBarBorderColor: "rgba(202, 202, 202, 1)",
      scrollBarBorderWidth: 0.5,
      scrollBarBoxBorderRadius: 4.125,
      scrollBarBoxColor: "rgba(192, 192, 192, 1)",
      scrollBarBoxMargin: 2,
      scrollBarBoxMinSize: 15,
      scrollBarBoxWidth: 8,
      scrollBarCornerBackgroundColor: "rgba(240, 240, 240, 1)",
      scrollBarCornerBorderColor: "rgba(202, 202, 202, 1)",
      scrollBarWidth: 11,
      selectionHandleBorderColor: "rgba(255, 255, 255, 1)",
      selectionHandleBorderWidth: 1.5,
      selectionHandleColor: '#A1A2A5',
      selectionHandleSize: 8,
      selectionHandleType: "square",
      selectionOverlayBorderColor: cellBorderColor,
      selectionOverlayBorderWidth: 1,
      treeArrowBorderColor: "rgba(195, 199, 202, 1)",
      treeArrowBorderWidth: 1,
      treeArrowClickRadius: 5,
      treeArrowColor: "rgba(155, 155, 155, 1)",
      treeArrowHeight: 8,
      treeArrowMarginLeft: 0,
      treeArrowMarginRight: 5,
      treeArrowMarginTop: 6,
      treeArrowWidth: 13,
      treeGridHeight: 250,
    };

    const grid = canvasDatagrid({
      allowColumnResize: true,
      allowColumnReordering: true,
      allowRowResize: false,
      autoResizeRows: false,
      editable: false,
      // showPerformance: true,
      parentNode: this.tableContainer.nativeElement,
      schema: this.columns,
      style,
    });

    (window as any).grid = grid;

    grid.style.height = '100%';
    grid.style.width = '100%';
    grid.data = this._items;
    grid.style = style;
    grid.attributes.allowSorting = false;
    grid.attributes.showRowHeaders = false;
    grid.attributes.showColumnHeaders = true;
    grid.attributes.snapToRow = true;
    grid.attributes.columnHeaderClickBehavior = 'none'

    grid.applyComponentStyle();
    grid.addEventListener('rendercell', this.renderCell)
    // grid.addEventListener('afterrendercell', afterRenderCell);

    this._grid = grid;
  }

  detectChanges() {
    const grid = this._grid;

    if (grid)
      grid.draw();
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

  resize() {
    if (this._grid)
      this._grid.resize(true);
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
