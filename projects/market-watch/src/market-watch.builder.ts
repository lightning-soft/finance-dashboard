import { MarketWatchItem } from './models/market-watch.item';
import { Id } from 'communication';
import { IInstrument } from 'trading';
import { ItemsBuilder } from 'base-components';
import { IMarketWatchItem, ItemType } from './models/interface-market-watch.item';
import { InstrumentHolder, LabelHolder, TabItem } from './tab.model';
import { MarketWatchLabelItem } from './models/market-watch-label.item';

export interface IHolder {
  item: MarketWatchItem;
  count: 1;
}

export class MarketWatchBuilder extends ItemsBuilder<InstrumentHolder, IMarketWatchItem> {
  private _itemsMap: Map<Id, IHolder> = new Map();
  deleteCallback: (instrument) => void;
  addCallback: (instrument) => void;

  get items(): IMarketWatchItem[] {
    return this._items;
  }

  public loadInstruments(instruments: IInstrument[]) {
    instruments.forEach(item => this.loadInstrument(item));
  }

  loadInstrument(instrument: IInstrument) {
    if (!this._itemsMap.has(instrument.id)) {
      this._itemsMap.set(instrument.id, { count: 1, item: new MarketWatchItem(instrument) });
      if (this.addCallback)
        this.addCallback(instrument);

    } else {
      const holder = this._itemsMap.get(instrument.id);
      holder.count++;
    }
  }

  displayItems(holders: TabItem[]) {
    this._items = holders.map((item: TabItem) => {
      const instrument = (item as InstrumentHolder).instrument;
      if (instrument) {
        const vm = this.getInstrumentItem(instrument);
        vm.subItems = vm.subItems.filter(subItem => subItem.itemType !== ItemType.CreateItem);
        vm.setHasCreatingOrder(false);
        vm.updateExpanded();
        return vm;
      }
      return new MarketWatchLabelItem((item as LabelHolder));
    });
  }

  hideSubItems() {
    this._items = this._items.filter(item => item.itemType !== ItemType.SubItem);
  }

  clearRealtimeData() {
    for (const holder of this._itemsMap.values()) {
      holder.item.clearRealtimeData();
    }
  }

  filterSubItems(callback) {
    this._items = this._items.filter(item => item.itemType !== ItemType.SubItem || callback(item));
  }

  deleteInstruments(instruments: IInstrument[]) {
    instruments.forEach(item => this.deleteItem(item));
  }

  deleteItem(instrument: IInstrument) {
    if (this._itemsMap.has(instrument.id)) {
      const holder = this._itemsMap.get(instrument.id);
      holder.count--;
      if (holder.count === 0) {
        this._itemsMap.delete(instrument.id);
        if (this.deleteCallback) {
          this.deleteCallback(instrument);
        }
      }
    }
  }

  deleteById(id: Id) {
    this._items = this._items.filter(item => item.id !== id);
  }

  deleteItems(items) {
    super.deleteItems(items);
    this._items = [...this._items];
  }

  deleteSubItems(instrument) {
    const item = this.getInstrumentItem(instrument);
    this.deleteItems(item.subItems);
  }

  getIndex(id: Id) {
    return this._items.findIndex(item => item.id === id);
  }

  getInstrumentItem(instrument: IInstrument): MarketWatchItem {
    return this._itemsMap.get(instrument.id)?.item;
  }

  getInstrumentsItems(instruments: IInstrument[]): MarketWatchItem[] {
    return instruments.map(this.getInstrumentItem.bind(this));
  }

  destroy() {
    if (this.deleteCallback) {
      for (const holder of this._itemsMap.values())
        this.deleteCallback(holder.item.instrument);
    }
  }

  getCreateOrderItem() {
    let orderItem = this.items.find(item => item.itemType === ItemType.CreateItem);
    if (orderItem)
      return orderItem;

    this.items.filter((item: MarketWatchItem) => item.getCreateItems).forEach((item: MarketWatchItem) => {
      const createItem = item.getCreateItems();
      if (item.getCreateItems().length) {
        orderItem = createItem[0];
        return;
      }
    });

    return orderItem;
  }

  getMarketWatchItems(): MarketWatchItem[] {
    return this.items.filter(item => item.itemType === ItemType.Item) as MarketWatchItem[];
  }
}
