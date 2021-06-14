import { Column } from '../types';

export interface IHandlerData<T = any> {
  item: T,
  column: Column
};

export interface IDataGridHandlerConfig<T, E = Event> {
  handler: (data: IHandlerData<T>, event: E) => void;
  handleHeaderClick?: boolean;
}
export enum Events {
  Click = 'click',
  DoubleClick = 'dblclick',
  Touchend = 'touchend',
  Keyup = 'keyup',
  Keydown = 'keydown',
  ContextMenu = 'contextmenu',
  MouseUp = 'mouseup',
  MouseDown = 'mousedown',

}

// export interface IHandler {
//   events: Events[];

//   handleEvent(event: Event);
// }
export abstract class DataGridHandler<T = any, E = Event> {
  event: Events;
  handleHeaderClick = false;
  protected handler: (data: IHandlerData<T>, event: E) => void;

  constructor(config: IDataGridHandlerConfig<T, E>) {
    this.handler = config.handler;
    this.handleHeaderClick = config.handleHeaderClick ?? false;
  }

  notify(data: IHandlerData<T>, event: E) {
    if ((data.item || this.handleHeaderClick) && typeof this.handler === 'function')
      this.handler(data, event);
  }
}

export interface DataClickHandlerConfig {
  column?: string;
  events?: Events[];
  handler: (data: CellClickData, event?: MouseEvent) => void;
}

// export abstract class ClickHandler implements IHandler {
//   // events = Detectizr.device.type === 'desktop' ? [Events.Click] : [Events.Touchend];
//   event = Events.Click;

//   abstract handleEvent(event: Event): boolean;
// }

// export class CellClickHandler extends ClickHandler {
//   private _column: string;
//   private _handler: (data: CellClickData, event?: MouseEvent) => void;

//   constructor(config: DataClickHandlerConfig) {
//     super();
//     this._handler = config.handler;
//     this._column = config.column;
//     if (config.events)
//       this.events = config.events;
//   }

//   handleEvent(event: MouseEvent) {
//     if (event && event.ctrlKey)
//       return false;

//     let row;
//     let column;

//     const findElements = (t) => {
//       if (!t || t.nodeName === TableNodes.Table)
//         return null;

//       if (t.nodeName === TableNodes.TD)
//         column = t.dataset && t.dataset.column;

//       if (t.nodeName === TableNodes.TR)
//         row = t.dataset && t.dataset.row;

//       if (column == null || row == null)
//         findElements(t.parentElement);
//     };

//     findElements(event.target);

//     if (this._column == null || this._column === column)
//       this._notifyClick({ row, column }, event);

//   }

//   private _notifyClick(data: CellClickData, event?: MouseEvent) {
//     if (typeof this._handler === 'function')
//       this._handler(data, event);
//   }
// }

export interface CellClickData {
  column: string;
  row: string;
}

export interface CellClickDataGridHandlerConfig<T, E = MouseEvent> extends IDataGridHandlerConfig<T, E> {
  column?: string | string[];
}

export class CellClickDataGridHandler<T> extends DataGridHandler<T, MouseEvent> {
  event = Events.Click;
  column: string | string[];

  constructor(config: CellClickDataGridHandlerConfig<T, MouseEvent>) {
    super(config);

    this.column = config.column;
    this.handler = config.handler;
  }
}

export class MouseUpDataGridHandler<T> extends CellClickDataGridHandler<T>{
  event = Events.MouseUp;

}
export class MouseDownDataGridHandler<T> extends CellClickDataGridHandler<T>{
  event = Events.MouseDown;

}
export class ContextMenuClickDataGridHandler<T> extends CellClickDataGridHandler<T> {
  event = Events.ContextMenu;
}


// export interface IContextMenuData {
//   item: any;
//   event: MouseEvent;
// }

// export class ContextMenuDataGridHandler<T> extends DataGridHandler<T> {
//   tableHandler;

//   constructor(config: IDataGridHandlerConfig<T>) {
//     super(config);
//     this.tableHandler = new CellClickHandler({
//       column: null,
//       events: [Events.ContextMenu],
//       handler: (data, event) => this._handleClick(data, event)
//     });
//   }

//   private _handleClick(data: CellClickData, event: MouseEvent) {
//     if (!this.dataGrid || !data)
//       return;

//     const item = this.dataGrid.items[data.row];

//     const contextMenuData: IContextMenuData = {
//       item,
//       event
//     };

//     if (item)
//       this.notify(contextMenuData);
//   }
// }
