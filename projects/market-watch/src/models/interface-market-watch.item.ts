import { Cell } from 'data-grid';
import { IBaseItem } from 'communication';
import { IInstrument } from 'trading';

export enum ItemType {
  Item,
  SubItem,
  CreateItem,
  Label,
}

export interface IMarketWatchItem extends IBaseItem {
  symbol: Cell;
  pos: Cell;
  last: Cell;
  netChange: Cell;
  percentChange: Cell;
  workingBuys: Cell;
  bidQuantity: Cell;
  bid: Cell;
  ask: Cell;
  askQuantity: Cell;
  workingSells: Cell;
  volume: Cell;
  settle: Cell;
  high: Cell;
  low: Cell;
  open: Cell;

  instrument: IInstrument;

  itemType: ItemType;

  clearRealtimeData();

  applySettings(settings);
}
