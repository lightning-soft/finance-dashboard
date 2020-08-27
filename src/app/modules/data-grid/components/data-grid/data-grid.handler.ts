export interface IDataGridHandlerConfig<T> {
  handler: (item: T) => void;
}
export enum Events {
  Click = 'click',
  DoubleClick = 'dblclick',
  Touchend = 'touchend',
  Keyup = 'keyup',
  Keydown = 'keydown',
  ContextMenu = 'contextmenu',
}
const enum TableNodes {
  Table = 'TABLE',
  TD = 'TD',
  TR = 'TR',
}

export interface IHandler {
  events: Events[];

  handleEvent(event: Event);
}

export abstract class DataGridHandler<T = any> {
  abstract tableHandler: IHandler;

  dataGrid: { items: T[] };

  protected handler: (item: any) => void;

  constructor(config: IDataGridHandlerConfig<T>) {
    this.handler = config.handler;
  }

  notify(item: any) {
    if (item && typeof this.handler === 'function')
      this.handler(item);
  }
}
export interface DataClickHandlerConfig {
  column?: string;
  handler: (data: CellClickData, event?: MouseEvent) => void;
}

export abstract class ClickHandler implements IHandler {
  // events = Detectizr.device.type === 'desktop' ? [Events.Click] : [Events.Touchend];
  events = [Events.Click];

  abstract handleEvent(event: Event): boolean;
}

export class CellClickHandler extends ClickHandler {
  private _column: string;
  private _handler: (data: CellClickData, event?: MouseEvent) => void;

  constructor(config: DataClickHandlerConfig) {
    super();
    this._handler = config.handler;
    this._column = config.column;
  }

  handleEvent(event: MouseEvent) {
    if (event && event.ctrlKey)
      return false;
    let row,
      column,
      findElements = (t) => {
        if (!t || t.nodeName === TableNodes.Table)
          return null;

        if (t.nodeName === TableNodes.TD)
          column = t.dataset && t.dataset.column;

        if (t.nodeName ===  TableNodes.TR)
          row = t.dataset && t.dataset.row;

        if (column == null || row == null)
          findElements(t.parentElement);
      };

    findElements(event.target);

    if (this._column == null || this._column === column)
      this._notifyClick({row, column}, event);

  }

  private _notifyClick(data: CellClickData, event?: MouseEvent) {
    if (typeof this._handler === 'function')
      this._handler(data, event);
  }
}

export interface CellClickData {
  column: string;
  row: string;
}

export interface CellClickDataGridHandlerConfig<T> extends IDataGridHandlerConfig<T> {
  column: string;
}

export class CellClickDataGridHandler<T> extends DataGridHandler<T> {
  tableHandler;

  constructor(config: CellClickDataGridHandlerConfig<T>) {
    super(config);
    this.tableHandler = new CellClickHandler({
      column: config.column,
      handler: (data) => this._handleClick(data)
    });
  }

  private _handleClick(data: CellClickData) {
    if (!this.dataGrid || !data)
      return;

    const item = this.dataGrid.items[data.row];

    if (item)
      this.notify(item);
  }
}
