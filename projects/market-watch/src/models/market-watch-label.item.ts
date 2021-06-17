import { IMarketWatchItem, ItemType } from './interface-market-watch.item';
import { DataCell } from 'data-grid';
import { Id } from 'communication';
import { LabelHolder } from '../tab.model';
import { IInstrument } from 'trading';
import { MarketWatchColumnsArray } from '../market-watch-columns.enum';

export const labelStatus = 'label';

export class MarketWatchLabelItem implements IMarketWatchItem {
  id: Id;
  ask = new DataCell({});
  askQuantity = new DataCell();
  bid = new DataCell();
  bidQuantity = new DataCell();
  high = new DataCell();
  last = new DataCell();
  low = new DataCell();
  netChange = new DataCell();
  open = new DataCell();
  percentChange = new DataCell();
  pos = new DataCell();
  settle = new DataCell();
  symbol = new DataCell();
  volume = new DataCell();
  workingBuys = new DataCell();
  workingSells = new DataCell();

  itemType = ItemType.Label;
  instrument: IInstrument;

  constructor(private labelHolder: LabelHolder) {
    this.symbol.updateValue(labelHolder.label);
    this.id = labelHolder.id;
    this.symbol.editable = true;
    this.symbol.editType = 'label';

    MarketWatchColumnsArray.forEach(key => this[key].changeStatus(labelStatus));

    this.symbol.editValueSetter = (input) => {
      const value = input.instance.value;
      if (value && value !== '')
        this.symbol.updateValue(value);
    };
  }

  applySettings(settings) {
  }
  clearRealtimeData() {
  }
}
