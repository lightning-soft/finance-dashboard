import { Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay/position/flexible-connected-position-strategy';
import { TemplatePortal } from '@angular/cdk/portal';
import { PortalOutlet } from '@angular/cdk/portal/portal';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { Layout } from 'layout';
import { NzDropDownDirective, NzDropdownMenuComponent, NzModalService, NzSelectComponent } from 'ng-zorro-antd';
import { Components } from 'src/app/modules';
import { IInstrument } from 'trading';
import { ConfirmModalComponent, RenameModalComponent } from 'ui';
import { Coords, EVENTS, IWindow } from 'window-manager';
import { IStockChartXInstrument } from '../datafeed/models';
import { ITimeFrame, StockChartXPeriodicity, TimeFrame } from '../datafeed/TimeFrame';
import { IChart } from '../models/chart';
import {
  IVolumeTemplate,
  VolumeProfileTemplatesRepository
} from '../volume-profile-custom-settings/volume-profile-templates.repository';
import drawings from './drawings';
import { compareTimeFrames } from './frame-selector/frame-selector.component';

declare const StockChartX;

@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends ItemsComponent<IVolumeTemplate> implements PortalOutlet, AfterViewInit {
  @Input() link: any;
  @Input() enableOrderForm = false;
  @Input() window: IWindow;
  @Input() chart: IChart;
  @Input() layout: Layout;
  @Output() enableOrderFormChange = new EventEmitter<boolean>();
  @ViewChild('menu2') menu: NzDropdownMenuComponent;
  @ViewChild(NzDropDownDirective, { static: true }) dropDownDirective: NzDropDownDirective;
  @ViewChild('price', { static: true }) priceComp: NzSelectComponent;

  zoomDropdownVisible = false;
  crossOpen = false;
  priceOpen = false;
  showFramePopover = false;

  get timePeriod() {
    return this.chart?.periodToLoad;
  }

  showToolbar = true;
  isDrawingsPinned = false;
  lastUsedDrawings = [];

  timeFrameOptions = [
    { interval: 1, periodicity: StockChartXPeriodicity.YEAR },
    { interval: 6, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 3, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 1, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 1, periodicity: StockChartXPeriodicity.WEEK },
    { interval: 1, periodicity: StockChartXPeriodicity.DAY },
    { interval: 4, periodicity: StockChartXPeriodicity.HOUR },
    { interval: 1, periodicity: StockChartXPeriodicity.HOUR },
    { interval: 1, periodicity: StockChartXPeriodicity.MINUTE }
  ] as ITimeFrame[];
  @Input() intervalOptions = [];
  @Input() periodOptions = [];

  priceStyles = ['heikinAshi', 'bar', 'coloredBar', 'candle',
    'hollowCandle', 'renko', 'lineBreak', 'kagi',
    'candleVolume', 'equiVolume', 'equiVolumeShadow',
    'line', 'mountain', 'pointAndFigure'];

  priceStyleNames = {
    heikinAshi: 'Heikin Ashi',
    bar: 'Bars',
    coloredBar: 'Colored Bars',
    candle: 'Candle',
    hollowCandle: 'Hollow Candle',
    renko: 'Renko',
    lineBreak: 'Line Break',
    kagi: 'Kagi',
    candleVolume: 'Candle Volume',
    equiVolume: 'Equi Volume',
    equiVolumeShadow: 'Equi Volume Shadow',
    line: 'Line',
    mountain: 'Mountain',
    pointAndFigure: 'Point And Figure'
  };

  zoomOptions = ['dateRange', 'rect'];

  zoomNames = {
    dateRange: 'Zoom Date Range',
    rect: 'Zoom Rect'
  };

  iconCrosses = ['dot', 'none', 'markers', 'crossBars'];

  cursorNames = {
    none: 'Arrow',
    dot: 'Dot',
    markers: 'Arrow with Markers',
    crossBars: 'Crosshairs',
  };

  shouldDrawingBeOpened = false;
  drawingMenuOffset: Coords = { x: 0, y: 0 };

  private _windowCoordsSnapshot: Coords;
  private _overlayRef: OverlayRef;
  private _positionStrategy: FlexibleConnectedPositionStrategy;

  get isDrawingsVisible() {
    return this.isDrawingsPinned || this.shouldDrawingBeOpened;
  }

  // allDrawings = ["dot", "note", "square", "diamond", "arrowUp", "arrowDown", "arrowLeft", "arrowRight", "arrow", "lineSegment",
  //   "rectangle", "triangle", "circle", "ellipse", "horizontalLine", "verticalLine", "polygon", "polyline", "freeHand", "cyclicLines",
  //   "text", "image", "balloon", "measure", "measureTool", "fibonacciArcs", "fibonacciEllipses", "fibonacciRetracements", "fibonacciFan",
  //   "fibonacciTimeZones", "fibonacciExtensions", "andrewsPitchfork", "trendChannel", "errorChannel", "quadrantLines", "raffRegression",
  //   "tironeLevels", "speedLines", "gannFan", "trendAngle"];

  drawingInstruments = drawings.map(item => {
    const formattedName = this.transformToUIName(item);
    const classItem = this.transformToClassName(item);
    return {
      ...item, className: classItem, formattedName, items: item.items.map(subItem => {
        const formattedSubName = this.transformToUIName(subItem);
        const classSubItem = this.transformToClassName(subItem);
        return { ...subItem, className: classSubItem, formattedName: formattedSubName };
      }),
    };
  });

  @HostBinding('class.opened')
  get isOpened() {
    return this.priceOpen || this.crossOpen ||
      this.showFramePopover || this.zoomDropdownVisible;
  }


  get timeFrame() {
    return this.chart?.timeFrame;
  }


  get instrument(): IInstrument {
    return this.chart?.instrument;
  }

  set instrument(instrument: IInstrument) {
    const { chart } = this;

    if (!chart || !instrument || chart.instrument?.id === instrument.id)
      return;

    setTimeout(() => {
      chart.instrument = {
        ...instrument,
        company: '',
      } as IStockChartXInstrument;
      chart.sendBarsRequest();
    });
  }

  get priceStyle() {
    return this.chart?.priceStyleKind ?? 'candle';
  }

  set priceStyle(value) {
    this.chart.priceStyleKind = value;
    this.chart.setNeedsUpdate();
  }

  get iconCross(): string {
    return this.chart?.crossHairType ?? 'none';
  }

  set iconCross(value: string) {
    this.chart.crossHairType = value;
  }

  @Output()
  createCustomVolumeProfile = new EventEmitter();

  @Output() loadedCustomeVolumeProfile = new EventEmitter<IVolumeTemplate>();

  constructor(private _cdr: ChangeDetectorRef,
              private elementRef: ElementRef,
              private _modalService: NzModalService,
              private _overlay: Overlay,
              protected _repository: VolumeProfileTemplatesRepository) {
    super();
    this._repository.updateAll$
      .pipe(untilDestroyed(this))
      .subscribe((items) => {
        this.builder.replaceItems(items);
      });
    this.autoLoadData = {
      onInit: true,
      onParamsChange: false,
      onQueryParamsChange: false,
      onConnectionChange: false,
    };

  }

  ngAfterViewInit() {
    (this.dropDownDirective as any).overlayRef = this;
    this.loadData();
    this._positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo((this.dropDownDirective as any).elementRef.nativeElement)
      .withLockedPosition()
      .withTransformOriginOn('.ant-dropdown');

    this._positionStrategy.withPositions([{
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    }]);
    // need to specify two classes for select component. Impossible via default input passing
    this.priceComp.cdkConnectedOverlay.panelClass = ['toolbar-dropdown', 'price-style-dropdown' ];
    this.window.on(EVENTS.FOCUS, this._updateOverlayZIndex.bind(this));
    this.window.on(EVENTS.BLUR, this._updateOverlayZIndex.bind(this));

    // this._volumeProfileTemplatesRepository.subscribe((data) => {
    //   this.customeVolumeTemplate = data?.items || [];
    // });
  }

  // #region OverlayRef

  attach(portal: TemplatePortal): void {
    if (!this._overlayRef) {
      this._overlayRef = this._overlay.create({
        positionStrategy: this._positionStrategy,
      });
    }

    this._overlayRef.attach(new TemplatePortal(this.menu.templateRef, (this.dropDownDirective as any).viewContainerRef));
    this._updateOverlayZIndex();
  }

  detach(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
    }
  }

  dispose(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  hasAttached(): boolean {
    return this._overlayRef.hasAttached();
  }

  getConfig() {
    return {};
  }

  // #endregion

  private _updateOverlayZIndex(): void {
    const overlayContainer = this._overlayRef?.hostElement?.parentElement;
    setTimeout(() => {
      if (overlayContainer)
        overlayContainer.style.zIndex = String(this.window.z);
    });
  }

  private _updateMenuOffset(): void {
    this.drawingMenuOffset = {
      x: this.window?.x - this._windowCoordsSnapshot?.x,
      y: this.window?.y - this._windowCoordsSnapshot?.y,
    };
  }

  updateOffset(): void {
    this._updateMenuOffset();
    this._cdr.detectChanges();
  }

  update() {
    this.isDrawingsPinned = false;
  }

  toggleDrawingVisible() {
    this.shouldDrawingBeOpened = !this.shouldDrawingBeOpened;
    if (this.shouldDrawingBeOpened && !this.isDrawingsPinned)
      this._updateCoordsSnapshot();
  }

  closeDrawing(): void {
    this.shouldDrawingBeOpened = false;
  }

  private _updateCoordsSnapshot(): void {
    if (this.isDrawingsVisible) {
      this._windowCoordsSnapshot = {
        x: this.window.x,
        y: this.window.y
      };

      this._updateMenuOffset();
    }
  }

  hasOneDrawing(drawingInstrument: any) {
    return drawingInstrument.items.length === 1;
  }

  compareInstrument = (o1: any | string, o2: any) => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.id : o1.id === o2.id;
    } else {
      return false;
    }
  }

  compareTimeFrame = (obj1: ITimeFrame, obj2: ITimeFrame) => {
    if (!obj1 || !obj2)
      return;

    return obj2.interval === obj1.interval
      && obj2.periodicity === obj1.periodicity;
  }

  compareFun = (o1: any | string, o2: any) => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.label : o1.value === o2.value;
    } else {
      return false;
    }
  }

  compareInstrumentDialog() {
    const { chart } = this;

    StockChartX.UI.ViewLoader.compareInstrumentDialog((dialog) => {
      dialog.show({
        chart,
        done: () => {
          if (chart) {
            chart.setNeedsUpdate();
          }
        }
      });
    });
  }

  openIndicatorDialog($event) {
    const widget = this.layout.findComponent((item: IWindow) => {
      return item.type === Components.Indicators && (item.component as any).link === this.link;
    });
    if (widget) {
      widget.focus();
      return;
    }

    this.layout.addComponent({
      component: {
        name: Components.Indicators,
        state: {
          link: this.link,
          chart: this.chart,
        },
      },
      width: 600,
      x: $event.clientX,
      y: $event.clientY,
      resizable: false,
      maximizable: false,
      allowPopup: false,
      closableIfPopup: true,
      minimizable: false,
      single: false,
      removeIfExists: false,
    });
  }

  changePriceStyle(option) {
    this.chart.priceStyleKind = option;
    this.chart.setNeedsUpdate();
  }

  changeCursor(option) {
    this.chart.crossHairType = option;
  }

  zoom(option) {
    this.chart.startZoomIn(option);
  }

  addDrawing(item: any) {
    const name = item.name ?? item;
    const chart = this.chart;
    chart.cancelUserDrawing();
    const drawing = StockChartX.Drawing.deserialize({ className: name });
    chart.startUserDrawing(drawing);
    this.addLastUsedDrawing(item);
  }

  addLastUsedDrawing(drawing: { name: string, className: string } | string) {
    if (!this.lastUsedDrawings.some(item => item === drawing)) {
      this.lastUsedDrawings = [drawing, ...this.lastUsedDrawings].slice(0, 3);
    }
  }

  removeDrawing() {
    this.chart.removeDrawings();
    this.chart.setNeedsUpdate(true);
  }

  stayInDragMode() {
    this.chart.stayInDrawingMode = !this.chart.stayInDrawingMode;
    this.chart.setNeedsUpdate(true);
  }

  visible() {
    this.chart.showDrawings = !this.chart.showDrawings;
    this.chart.setNeedsUpdate(true);
  }

  makeSnapshot() {
    this.chart.saveImage();
  }

  // private _mapDrawingInstruments(): void {
  //   this.drawingInstruments.forEach(instrument => {
  //     instrument.items.forEach(item => {
  //       this._drawingClassName.set(item, this._transformToClassName(item));
  //     });
  //   });
  // }


  public transformToUIName(drawing: any): string {
    const str = drawing?.name ?? drawing;
    const nameUI = str.replace(/[A-Z]/g, ' $&');
    return nameUI[0].toUpperCase() + nameUI.slice(1);
  }

  public transformToClassName(drawing: any): string {
    const str = drawing?.className ?? drawing;
    if (typeof str !== 'string')
      return '';

    const className = str.replace(/[A-Z]/g, '-$&').toLowerCase();
    return className;
  }

  toggleForm() {
    this.enableOrderForm = !this.enableOrderForm;
    this.enableOrderFormChange.emit(this.enableOrderForm);
  }

  createVolumeProfile() {
    this.createCustomVolumeProfile.emit();
  }

  loadCustomeVolumeTemplate(template: IVolumeTemplate): void {
    this.loadedCustomeVolumeProfile.emit(template);
  }

  editCustomProfile(template: IVolumeTemplate): void {
    const modal = this._modalService.create({
      nzTitle: 'Edit name',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        label: 'Template name',
      },
    });

    modal.afterClose.subscribe(name => {
      if (!name)
        return;

      this._repository.updateItem({ ...template, name }).subscribe();
    });
  }

  deleteVolumeProfile(template: IVolumeTemplate): void {
    const modal = this._modalService.create({
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the template?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result.confirmed) {
        this._repository.deleteItem(template.id).subscribe();
      }
    });
  }

  onIntervalAdded(frame: any) {
    const intervalOption = this.intervalOptions
      .find(item => {
        return item.periodicities.includes(frame.periodicity);
      });
    const timeFrames = intervalOption.timeFrames;
    if (timeFrames && !timeFrames.some(item => compareTimeFrames(item, frame))) {
      timeFrames.push(frame);
      intervalOption.timeFrames = TimeFrame.sortTimeFrames(timeFrames);
    }
  }

  onPeriodAdded(frame: any) {
    const period = this.periodOptions.find(item => item.periodicity === frame.periodicity);
    const timeFrames = period?.timeFrames;
    if (timeFrames && !timeFrames.some(item => item.interval === frame.interval)) {
      timeFrames.push(frame);
      period.timeFrames = timeFrames.sort((a, b) => a.interval - b.interval);
    }
  }
}
