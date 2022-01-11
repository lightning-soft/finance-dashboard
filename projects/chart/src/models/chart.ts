import { IDatafeed, IStockChartXInstrument, IStockChartXTimeFrame } from '../datafeed';
import { IChartConfig } from './chart.config';
import { IsAutomaticPixelPrice } from "../chart-settings/settings";


export enum ScxOrderAction {
  BUY = 'buy',
  SELL = 'sell'
}

export interface ISideDetails {
  [key: string]: any;
  volume: number;
  tradesCount: number;
}

export interface IDetails {
  [key: string]: any;
  bidInfo: ISideDetails;
  askInfo: ISideDetails;
  volume: number;
  tradesCount: number;
  price: number;
}

export interface IOHLVData {
  open: number | string;
  high: number | string;
  low: number | string;
  volume: number | string;
  income: number | string;
  incomePercentage: number;
}

export interface IBar {
  close: number;
  high: number;
  low: number;
  open: number;
  date: Date;
  volume: number;
  ticksCount?: number;
  details?: IDetails[];
 /* isFalling: boolean;
  isRaising: boolean;
  range: number;
  timestamp: string;*/
}

export enum ScxOrderKind {
  MARKET = 'market',
  STOP = 'stop',
  LIMIT = 'limit',
  STOP_LIMIT = 'stopLimit',
}

export enum ScxOrderState {
  PENDING_SUBMIT = 'pendingSubmit',
  PENDING_CANCEL = 'pendingCancel',
  PENDING_REPLACE = 'pendingReplace',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
}

export enum ScxOrderTimeInForce {
  GOOD_TILL_DATE = 'goodTillDate',
  DAY = 'day',
  GOOD_TILL_CANCEL = 'goodTillCanceled',
}

export interface ScxOrderBarEvents {
  ORDER_SETTINGS_CLICKED: string;
  ACCEPT_ORDER_CLICKED: string;
  CANCEL_ORDER_CLICKED: string;
  ORDER_PRICE_CHANGED: string;
  ORDER_CREATED: string;
  ORDER_UPDATED: string;
  CREATE_ORDER_SETTINGS_CLICKED: string;
  BUY_AREA_CONTEXT_MENU_CLICKED: string;
  SELL_AREA_CONTEXT_MENU_CLICKED: string;
}

export interface IScxOrder {
  id?: number;
  price?: number;
  stopPrice?: number;
  action?: ScxOrderAction;
  kind?: ScxOrderKind;
  quantity?: number;
  state?: ScxOrderState;
  timeInForce?: ScxOrderTimeInForce;
  date?: Date;
}

export interface IOrderBarConfig {
  order: IScxOrder;
}

declare class OrderBar {
  order: IScxOrder;

  new(config: IOrderBarConfig);
}

export interface IOrdersHolder {
  readonly orders: OrderBar[];

  addOrder(order: OrderBar);

  removeOrder(order: OrderBar);

  addCreationOrder();
}

export enum ScxPositionKind {
  SHORT = 'short',
  LONG = 'long',
}

export interface IScxPosition {
  id: number | string;
  price: number;
  kind: ScxPositionKind;
  quantity: number;
}


export enum PositionBarEvents {
  CLOSE_POSITION_CLICKED = 'closePositionClicked'
}

export interface IPositionBarConfig {
  position: IScxPosition;
}

export interface PositionBar {
  position: IScxPosition;

  new(config: IPositionBarConfig);
}

export interface IPositionsHolder {
  readonly positions: PositionBar[];

  addPosition(order: PositionBar);

  removePosition(position: PositionBar);
}

interface IEventableObject {
  suppressEvents(suppress?: boolean): any;

  fire(eventType: string, event: any): any;

  fireValueChanged(eventType: string, newValue: any, oldValue?: any): any;
}

interface IDestroyable {
  destroy();
}

export interface IChart extends IEventableObject, IDestroyable, IOrdersHolder, IPositionsHolder {
  /**
   * The chart's parent container.
   * @name container
   * @type {jQuery}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly container: JQuery;
  readonly rootDiv: JQuery;
  /**
   * The date scale.
   * @name dateScale
   * @type {StockChartX.DateScale}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly dateScale: any;
  readonly valueScales: any[];
  /**
   * The value scale.
   * @name valueScale
   * @type {StockChartX.ValueScale}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly valueScale: any;
  /**
   * The chart panels container.
   * @name chartPanelsContainer
   * @type {StockChartX.ChartPanelsContainer}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly chartPanelsContainer: any;
  /**
   * The data manager (manages data series).
   * @name dataManager
   * @type {StockChartX.DataManager}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly dataManager: any;
  /**
   * The bars time interval in milliseconds.
   * @name timeInterval
   * @returns {Number}
   * @see {@linkcode StockChartX.TimeSpan}
   * @memberOf StockChartX.Chart#
   * @deprecated since version 2.20
   */
  timeInterval: number;

  setBarCount(value: number);

  shouldDraw: boolean;

  /**
   * The bars time frame.
   * @name timeFrame
   * @type {StockChartX.ITimeFrame}
   * @memberOf StockChartX.Chart#
   */
  timeFrame: IStockChartXTimeFrame;

  periodToLoad: IStockChartXTimeFrame;

  readonly chartPanelsFrame: any;
  /**
   * The instrument.
   * @name instrument
   * @type {StockChartX.Instrument}
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.instrument = {
         *      symbol: 'GOOG',
         *      company: 'Google Inc.'
         *      exchange: 'NSDQ'
         *  };
   */
  instrument: IStockChartXInstrument;
  /**
   * The array of chart indicators.
   * @name indicators
   * @type {StockChartX.Indicator[]}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly indicators: any[];
  readonly valueMarker: any;
  readonly dateMarker: any;
  /**
   * The locale string (e.g. 'en-US').
   * @name locale
   * @type {string}
   * @default 'en-US'
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.locale = 'uk-UA';
   */
  locale: string;
  /**
   * The flag that indicates whether keyboard events should be processed.
   * @name keyboardEventsEnabled
   * @type {boolean}
   * @default true
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.keyboardEventsEnabled = true;     // enable keyboard events
   *  chart.keyboardEventsEnabled = false;    // disable keyboard events.
   */
  keyboardEventsEnabled: boolean;
  /**
   * The flag that indicates whether mouse events should be processed.
   * @name mouseEventsEnabled
   * @type {boolean}
   * @default true
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.mouseEventsEnabled = true;     // enable mouse events
   *  chart.mouseEventsEnabled = false;    // disable mouse events.
   */
  mouseEventsEnabled: boolean;
  /**
   * The flag that indicates whether scrolling is enabled.
   * @name scrollEnabled
   * @type {boolean}
   * @memberOf StockChartX.Chart#
   * @since 2.16.1
   */
  scrollEnabled: boolean;
  /**
   * The flag that indicates whether zooming is enabled.
   * @name zoomEnabled
   * @type {boolean}
   * @memberOf StockChartX.Chart#
   * @since 2.16.1
   */
  zoomEnabled: boolean;
  /**
   * The chart theme.
   * @name theme
   * @type {Object}
   * @memberOf StockChartX.Chart#
   */
  theme: any;
  showBarInfoInTitle: boolean;

  incomePrecision: number;
  /**
   * The flag that indicates whether instrument watermark should be visible.
   * @name showInstrumentWatermark
   * @type {boolean}
   * @memberOf StockChartX.Chart#
   * @since 2.16.1
   */
  showInstrumentWatermark: boolean;
  /**
   * The price style.
   * @name priceStyle
   * @type {StockChartX.PriceStyle}
   * @see {@linkcode StockChartX.PriceStyle}
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.priceStyle = StockChartX.PriceStyle.BAR; // set 'bars' price style.
   */
  priceStyle: any;
  priceStyleKind: string;
  readonly hoveredRecord: number;
  /**
   * The cross hair object.
   * @name crossHair
   * @type {StockChartX.CrossHair}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly crossHair: any;
  /**
   * The break line object.
   * @name break line
   * @type {StockChartX.BreakLinesHandler}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly sessionBreakLines: any;
  /**
   * The currently selected object.
   * @name selectedObject
   * @type {StockChartX.Drawing}
   * @memberOf StockChartX.Chart#
   */
  selectedObject: any;
  readonly selectionMarker: any;
  /**
   * The flag that indicates whether drawings should be drawn.
   * @name showDrawings
   * @type {boolean}
   * @default true
   * @memberOf StockChartX.Chart#
   */
  showDrawings: boolean;
  showDrawingTooltips: boolean;
  /**
   * Drawing Mode
   * @name stayInDrawingMode
   * @type {boolean}
   * @memberOf StockChartX.Chart#
   */
  stayInDrawingMode: boolean;
  /**
   * The flag that indicates whether X grid lines are visible.
   * @name xGridVisible
   * @type {boolean}
   * @memberOf StockChartX.Chart#
   * @since 2.16.1
   */
  xGridVisible: boolean;
  /**
   * The flag that indicates whether Y grid lines are visible.
   * @name yGridVisible
   * @type {boolean}
   * @memberOf StockChartX.Chart#
   * @since 2.16.1
   */
  yGridVisible: boolean;
  state: number;
  /**
   * Gets window mode handler.
   * @name windowModeHandler
   * @type {StockChartX.WindowModeHandler}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly windowModeHandler: any;
  /**
   * Gets current window mode.
   * @name windowMode
   * @type {StockChartX.WindowMode}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly windowMode: any;
  readonly keyboardHandler: any;
  /**
   * The size of chart.
   * @name size
   * @type {StockChartX~Size}
   * @memberOf StockChartX.Chart#
   */
  size: any;
  /**
   * The css-size of chart.
   * @name cssSize
   * @type {StockChartX~CssSize}
   * @memberOf StockChartX.Chart#
   */
  cssSize: any;
  /**
   * The main chart panel.
   * @name mainPanel
   * @type {StockChartX.ChartPanel}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly mainPanel: any;
  /**
   * The number of records on the chart.
   * @name recordCount
   * @type {number}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly recordCount: number;
  /**
   * The first visible record.
   * @name firstVisibleRecord
   * @type {number}
   * @memberOf StockChartX.Chart#
   */
  firstVisibleRecord: number;
  /**
   * The last visible record.
   * @name lastVisibleRecord
   * @type {number}
   * @memberOf StockChartX.Chart#
   */
  lastVisibleRecord: number;
  /**
   * Gets index of first visible record.
   * @name firstVisibleIndex
   * @type {number}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly firstVisibleIndex: number;
  /**
   * Gets index of last visible record.
   * @name lastVisibleIndex
   * @type {number}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly lastVisibleIndex: number;
  /**
   * An array of chart panels.
   * @name chartPanels
   * @type {StockChartX.ChartPanel[]}
   * @readonly
   * @memberOf StockChartX.Chart#
   */
  readonly chartPanels: any[];
  readonly spread: any;
  readonly highlightedColumns: any;
  /**
   * The cross hair type.
   * @name crossHairType
   * @type {StockChartX.CrossHairType}
   * @memberOf StockChartX.Chart#
   */
  crossHairType: string;
  zoomInView: any;
  /**
   * Gets/Sets datafeed.
   * @name datafeed
   * @type {StockChartX.IDatafeed}
   * @memberOf StockChartX.Chart#
   */
  datafeed: IDatafeed;
  readonly navigation: any;
  toolbar: any;
  scrollbar: any;
  /**
   * Root container multiChart.
   * @name multiChartRootContainer
   * @type {JQuery}
   * @memberOf StockChartX.Chart#
   */
  multiChartRootContainer: JQuery;
  stateHandler: any;
  saveImageHandler: any;
  readonly smartPriceStyleHandler: any;
  readonly instrumentComparisonHandler: any;
  readonly readyLoadMoreHistory;
  _allowReadMoreHistory;
  allowReadMoreHistory: boolean;

  new(config: IChartConfig);

  updateOHLVData(data: IOHLVData);

  localize(element?: JQuery): void;

  localizeText(key: string, replace?: object): Promise<string>;


  setDates(startDate: Date, endDate: Date): void;

  /**
   * Send bars request.
   * @method sendBarsRequest
   * @memberOf StockChartX.Chart#
   */
  sendBarsRequest(): void;

  requestMoreBars(): void;

  /**
   * Returns chart bounds rectangle.
   * @method getBounds
   * @returns {StockChartX.Rect}
   * @memberOf StockChartX.Chart#
   */
  getBounds(): any;

  /**
   * Selects new chart object. E.g. drawing.
   * @method selectObject
   * @param {StockChartX.Drawing} obj
   * @returns {boolean} True if selection is changed, false otherwise.
   * @memberOf StockChartX.Chart#
   */
  selectObject(obj: any): boolean;

  /**
   * Adds new value scale.
   * @method addValueScale
   * @param {StockChartX.ValueScale} [valueScale] The value scale.
   * @returns StockChartX.ValueScale
   * @memberOf StockChartX.Chart#
   */
  addValueScale(valueScale?: any): any;

  removeValueScale(valueScale: any | any[]): void;

  /**
   * Adds one or more indicators.
   * @method addIndicators
   * @param {number | StockChartX.Indicator | number[] | StockChartX.Indicator[]} indicators The indicator(s) to be added.
   * It can be TA indicator number or StockChartX.Indicator instance.
   * @returns {StockChartX.Indicator|StockChartX.Indicator[]} Added indicators.
   * @memberOf StockChartX.Chart#
   * @see [removeIndicators]{@linkcode StockChartX.Chart#removeIndicators} to remove indicators.
   * @example <caption>Add bollinger bands indicator</caption>
   *  var bollingerBandsIndicator = chart.addIndicators(BollingerBands);
   * @example <caption>Add RSI and Bollinger bands indicators.</caption>
   *  var indicators = chart.addIndicators([RelativeStrengthIndex, BollingerBands]);
   *  @example <caption>Configure and add indicator.</caption>
   *  var rsi = new StockChartX.TAIndicator({taIndicator: RelativeStrengthIndex});
   *  rsi.setParameterValue(StockChartX.IndicatorParam.PERIODS, 20);
   *  chart.addIndicators(rsi);
   */
  addIndicators(indicators: number | number[] | any | any[]): any;

  /**
   * Removes one or more indicators.
   * @method removeIndicators
   * @param {StockChartX.Indicator | StockChartX.Indicator[]} [indicators] Indicator(s) to remove.
   * All indicators are removed if omitted.
   * @param {boolean} [removePanelIfNoPlots] The flag that indicates if panel should be removed
   * if there are no plots on it any more. True by default.
   * @memberOf StockChartX.Chart#
   * @see [addIndicators]{@linkcode StockChartX.Chart#addIndicators} to add indicators.
   * @example <caption>Remove all indicators from the chart.</caption>
   * chart.removeIndicators();
   *
   * @example <caption>Remove RSI indicator</caption>
   * // Assume that rsi indicator was added already.
   * // var rsi = chart.addIndicators(RelativeStrengthIndex);
   *
   * chart.removeIndicators(rsi);
   * @example <caption>Remove all indicators</caption>
   * chart.removeIndicators();
   */
  removeIndicators(indicators?: any | any[], removePanelIfNoPlots?: boolean): void;

  /**
   * Updates all indicators. It needs to be called after data series values are changed.
   * @method updateIndicators
   * @memberOf StockChartX.Chart#
   * @see [addIndicators]{@linkcode StockChartX.Chart#addIndicators} to add indicators.
   * @see [removeIndicators]{@linkcode StockChartX.Chart#removeIndicators} to remove indicators.
   * @example
   *  chart.updateIndicators();
   */
  updateIndicators(): void;

  /**
   * Saves indicators state.
   * @method saveIndicatorsState
   * @returns {Object[]} An array of indicator states.
   * @memberOf StockChartX.Chart#
   * @see [loadIndicatorsState]{@linkcode StockChartX.Chart#loadIndicatorsState} to load indicators.
   * @example
   *  var state = chart.saveIndicatorsState();
   */
  saveIndicatorsState(): any[];

  /**
   * Loads indicators state.
   * @method loadIndicatorsState
   * @param {String | Object} state The indicators state serialized by saveIndicatorsState function.
   * @memberOf StockChartX.Chart#
   * @see [saveIndicatorsState]{@linkcode StockChartX.Chart#saveIndicatorsState} to save indicators.
   * @example <caption>Save and load indicators state</caption
   *  var state = chart.saveIndicatorsState();
   *  chart.loadIndicatorsState(state);
   */
  loadIndicatorsState(state: any): void;

  /**
   * Saves all drawings.
   * @method saveDrawingsState
   * @returns {Object[]} The array of drawing states.
   * @memberOf StockChartX.Chart#
   * @see [loadDrawingsState]{@linkcode StockChartX.Chart#loadDrawingsState} to load drawings.
   * @example
   *  var state = chart.saveDrawingsState();
   */
  saveDrawingsState(): any[];

  /**
   * Loads drawings.
   * @method loadDrawingsState
   * @param {String | Object} state The drawings state serialized by saveDrawingsState function.
   * @memberOf StockChartX.Chart#
   * @see [saveDrawingsState]{@linkcode StockChartX.Chart#saveDrawingsState} to save drawings.
   * @example
   *  var state = chart.saveDrawingsState();
   *  chart.loadDrawingsState(state);
   */
  loadDrawingsState(state: any): void;

  /**
   * Removes all drawings.
   * @method removeDrawings
   * @memberOf StockChartX.Chart#
   * @see [saveDrawingsState]{@linkcode StockChartX.Chart#saveDrawingsState} to save drawings.
   * @see [loadDrawingsState]{@linkcode StockChartX.Chart#loadDrawingsState} to load drawings.
   * @example
   *  chart.removeDrawings();
   */
  removeDrawings(): void;

  /**
   * Saves chart state (including indicators and drawings).
   * @method saveState
   * @returns {Object} The chart state.
   * @memberOf StockChartX.Chart#
   * @see [loadState]{@linkcode StockChartX.Chart#loadState} to load state.
   * @example
   *  var state = chart.saveState();
   */
  saveState(): any;

  /**
   * Loads chart state.
   * @method loadState
   * @param {String | Object} state The chart state serialized by saveState function.
   * @memberOf StockChartX.Chart#
   * @see [saveState]{@linkcode StockChartX.Chart#saveState} to save state.
   * @example
   *  var state = chart.saveState();
   *  chart.loadState(state);
   */
  loadState(state: any): void;

  _restoreValueScales(state: any): void;

  /**
   * Starts new user drawing.
   * @method startUserDrawing
   * @param {StockChartX.Drawing} drawing The new user drawing object.
   * @memberOf StockChartX.Chart#
   * @see [cancelUserDrawing]{@linkcode StockChartX.Chart#cancelUserDrawing} to cancel user drawing.
   * @example
   *  var line = new StockChartX.LineSegmentDrawing();
   *  chart.startUserDrawing(line);
   */
  startUserDrawing(drawing: any): void;

  /**
   * Cancels user drawing.
   * @method cancelUserDrawing
   * @memberOf StockChartX.Chart#
   * @see [startUserDrawing]{@linkcode StockChartX.Chart#startUserDrawing} to start user drawing.
   * @example
   *  chart.cancelUserDrawing();
   */
  cancelUserDrawing(): void;

  _finishUserDrawing(): void;

  /**
   * Starts zooming.
   * @method startZoomIn
   * @param {StockChartX.Drawing} zoomMode Zoom mode.
   * @memberOf StockChartX.Chart#
   * @see [cancelZoomIn]{@linkcode StockChartX.Chart#cancelZoomIn} to cancel zooming.
   * @example
   *  chart.startZoomIn(ZoomInMode.DATE_RANGE);
   */
  startZoomIn(zoomMode: any): void;

  /**
   * Cancels zooming.
   * @method cancelUserDrawing
   * @memberOf StockChartX.Chart#
   * @see [startZoomIn]{@linkcode StockChartX.Chart#startZoomIn} to start zooming.
   * @example
   *  chart.cancelZoomIn();
   */
  cancelZoomIn(): void;

  /**
   * Marks that auto-scaling needs to be performed on next layout (affects all scales, including date scale).
   * @method setNeedsAutoScaleAll
   * @memberOf StockChartX.Chart#
   */
  setNeedsAutoScaleAll(): void;

  setWindowMode(mode: any): void;

  setNeedsLayout(): void;

  /**
   * Layouts chart elements.
   * @method layout
   * @memberOf StockChartX.Chart#
   */
  layout(): void;

  handleResize(): void;

  /**
   * Draws chart.
   * @method draw
   * @memberOf StockChartX.Chart#
   */
  draw(): void;

  _drawLogo(): void;

  /**
   * Layouts and draws chart.
   * @method update
   * @memberOf StockChartX.Chart#
   */
  update(): void;

  setNeedsUpdate(needsAutoScale?: boolean): void;

  updateSplitter(splitter: any): void;

  destroy(removeContainer?: boolean): void;

  showWaitingBar(config?: any): void;

  hideWaitingBar(hideAnyway?: boolean): void;

  _copyDrawing(): void;

  _pasteDrawing(): void;

  _handleMouseEvents(event: JQueryEventObject): boolean;

  /**
   * Saves chart as image.
   * @method saveImage
   * @param {CanvasImageCallback} [saveCallback] The callback for custom saving.
   * @memberOf StockChartX.Chart#
   */
  saveImage(saveCallback?: any): void;

  applyTheme(): void;

  _updateHoverRecord(x: number): void;

  setPixelsPrice(pixels: number): void;
  setValueScaleType(type: IsAutomaticPixelPrice): void;

  getPixelsPrice(): number;

  pixelsPrice: number;

  /**
   * Returns bar data series.
   * @method barDataSeries
   * @returns {StockChartX~BarDataSeries} An object with date, open, high, low, close, volume properties.
   * @memberOf StockChartX.Chart#
   * @example
   *  var obj = chart.barDataSeries();
   *  var dates = obj.date;       // Date data series
   *  var opens = obj.open;       // Open data series
   *  var highs = obj.high;       // High data series
   *  var lows = obj.low;         // Low data series
   *  var closes = obj.close;     // Close data series
   *  var volumes = obj.volume;   // Volume data series
   */
  barDataSeries(): any;

  /**
   * Returns bar data series.
   * @method getCommonDataSeries
   * @returns {StockChartX~BarDataSeries}
   * @memberOf StockChartX.Chart#
   * @deprecated since version 2.12.4
   */
  getCommonDataSeries(): any;

  /**
   * Adds data series into the data manager.
   * @method addDataSeries
   * If you specify data series name a new data series will be created and added.
   * @param {String | StockChartX.DataSeries} dataSeries The data series name or data series object.
   * @param {Boolean} [replaceIfExists = false] Determines whether existing data series with the same name
   * should be replace or an exception should be thrown.
   * @returns {StockChartX.DataSeries} The data series that has been added.
   * @memberOf StockChartX.Chart#
   * @example
   *  // Add existing data series.
   *  chart.addDataSeries(new StockChartX.DataSeries("OpenInterest"));
   *
   *  // Add new data series with a given name.
   *  chart.addDataSeries("OpenInterest2");
   *
   *  // Add/Replace data series.
   *  chart.addDataSeries("OpenInterest", true);
   */
  addDataSeries(dataSeries: string | any, replaceIfExists?: boolean): any;

  /**
   * Removes given data series. Removes all data series if parameter is omitted.
   * @method removeDataSeries
   * @param {String | StockChartX.DataSeries} [dataSeries] The data series object or data series name.
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.removeDataSeries('OpenInterest'); // Removes 'OpenInterest' data series.
   *  chart.removeDataSeries();               // Removes all data series.
   */
  removeDataSeries(dataSeries: string | any): void;

  /**
   * Removes all values from a given data series. Clears all values in all data series if parameter is omitted.
   * @method clearDataSeries
   * @param {String | StockChartX.DataSeries} [dataSeries] The data series name or data series object.
   * @memberOf StockChartX.Chart#
   */
  clearDataSeries(dataSeries: string | any): void;

  /**
   * Trims all data series to a given maximum length.
   * @method trimDataSeries
   * @param {number} maxLength The new maximum length of data series.
   * @memberOf StockChartX.Chart#
   */
  trimDataSeries(maxLength: number): void;

  /**
   * Returns data series with a given name.
   * @method getDataSeries
   * @param {String} name The data series name.
   * @returns {StockChartX.DataSeries}
   * @memberOf StockChartX.Chart#
   * @example
   *  var dataSeries = chart.getDataSeries("OpenInterest");
   */
  getDataSeries(name: string): any;

  primaryDataSeries(suffix: string, symbol?: string): any;

  primaryBarDataSeries(symbol?: string): any;

  /**
   * Returns bar at a given index or date.
   * @param {number | Date} indexOrDate The bar's index or date.
   * @param {string} [symbol] The symbol.
   * @returns {IBar}
   * @since 2.16
   */
  primaryBar(indexOrDate: number | Date, symbol?: string): any;

  /**
   * Finds data series with a given suffix.
   * @method findDataSeries
   * @param {String} suffix The data series suffix.
   * @returns {StockChartX.DataSeries}
   * @memberOf StockChartX.Chart#
   * @example
   *  var dataSeries = chart.findDataSeries(StockChartX.OPEN_DATA_SERIES_SUFFIX);
   */
  findDataSeries(suffix: string): any;

  /**
   * Appends values from single bar or an array of bars into the corresponding data series.
   * @method appendBars
   * @param {Bar | Bar[]} bars The single bar or an array of bars.
   * @memberOf StockChartX.Chart#
   * @example
   *  // Append 1 bar
   *  chart.appendBars({
         *      date: new Date(),
         *      open: 100.0,
         *      high: 101.0,
         *      low: 99.0,
         *      close: 100.5,
         *      volume: 200
         *  });
   *
   *  // Append 2 bars
   *  chart.appendBars({
         *  [
         *      {
         *          date: new Date(),
         *          open: 100.0,
         *          high: 101.0,
         *          low: 99.0,
         *          close: 100.5,
         *          volume: 200
         *      },
         *      {
         *          date: new Date(),
         *          open: 100.5,
         *          high: 101.0,
         *          low: 100.0,
         *          close: 100.2,
         *          volume: 300
         *      }
         *  ]
         *  });
   */
  appendBars(bars: IBar | IBar[]): void;

  /**
   * Adds new chart panel.
   * @method addChartPanel
   * @param {Number} [index] The index to insert panel at.
   * @param {Number} [heightRatio] The height ratio of new panel. The value in range (0..1).
   * @param {Boolean} [shrinkMainPanel] True to shrink main panel, false to shrink all panels.
   * @returns {StockChartX.ChartPanel} The newly created chart panel.
   * @memberOf StockChartX.Chart#
   * @example
   *  chart.addChartPanel();  // Add new chart panel.
   *  chart.addChartPanel(2); // Insert new chart panel at index 2.
   */
  addChartPanel(index?: number, heightRatio?: number, shrinkMainPanel?: boolean): any;

  /**
   * Returns chart panel at a given Y coordinate.
   * @method findPanelAt
   * @param {number} y The Y coordinate.
   * @returns {StockChartX.ChartPanel}
   * @memberOf StockChartX.Chart#
   */
  findPanelAt(y: number): any;

  /**
   * Marks that all value scales need to be auto-scaled on next layout.
   * @method setNeedsAutoScale
   * @memberOf StockChartX.Chart#
   */
  setNeedsAutoScale(): void;

  /**
   * Scrolls chart on a given number of pixels.
   * @method scrollOnPixels
   * @param {number} pixels The number of pixels to scroll.
   * @memberOf StockChartX.Chart#
   */
  scrollOnPixels(pixels: number): void;

  /**
   * Scrolls chart on a given number of records.
   * @method scrollOnRecords
   * @param {number} records The number of records to scroll.
   * @memberOf StockChartX.Chart#
   */
  scrollOnRecords(records: number): void;

  /**
   * Zooms chart on a given number of pixels.
   * @method zoomOnPixels
   * @param {number} pixels The number of pixels to zoom.
   * @memberOf StockChartX.Chart#
   */
  zoomOnPixels(pixels: number): void;

  /**
   * Zooms chart on a given number of records.
   * @method zoomOnRecords
   * @param {number} records The number of records to zoom.
   * @memberOf StockChartX.Chart#
   */
  zoomOnRecords(records: number): void;

  visibleDataRange(): {
    firstVisibleDataRecord: number;
    lastVisibleDataRecord: number;
  };

  /**
   * Updates visible range to show records in a given range.
   * @method recordRange
   * @param {number} [firstRecord] The first record to show. Or number of last records to show if second argument is omitted.
   * @param {number} [lastRecord] The last record to show.
   * @memberOf StockChartX.Chart#
   */
  recordRange(firstRecord?: number, lastRecord?: number): {
    firstVisibleRecord: number;
    lastVisibleRecord: number;
  };

  /**
   * Calculate bars count between two points
   * @method barsBetweenPoints
   * @param {IPoint | IChartPoint} startPoint The start point.
   * @param {IPoint | IChartPoint} endPoint The end point.
   * @returns {number} Number of bars
   * @memberOf StockChartX.Chart#
   * @example
   *  recordsCount = chart.barsBetweenPoints(
   *  {
         *      x: 50,
         *      y: 20
         *  },
   *  {
         *      x: 500,
         *      y: 30
         *  });
   */
  barsBetweenPoints(startPoint: any | any, endPoint: any | any): number;

  /**
   * Updates visible range to show values in a given date range.
   * @method dateRange
   * @param {Date} [startDate] The start date.
   * @param {Date} [endDate] The end date.
   * @memberOf StockChartX.Chart#
   */
  dateRange(startDate?: Date, endDate?: Date): {
    startDate: Date;
    endDate: Date;
  };

  reload(): void;

  updateComputedDataSeries(): void;

  addCssClass(cssClass: string): void;

  removeCssClass(cssClass: string): void;

  loadFromLastToNow();

  loadDateRange(kind: string, fromDate: Date, endDate: Date);

  on(event: string, fn: (e: any) => void): void;

  off(event: string, fn: (e: any) => void): void;
}
