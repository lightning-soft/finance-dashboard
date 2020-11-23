import { IBaseItem } from 'communication';
import { GroupItemsBuilder } from './group-items.builder';
import { ItemsBuilder } from './items.builder';

export interface IViewItem<T> extends IBaseItem {
  update(item: T);
}

export class ViewItemsBuilder<T extends IBaseItem, VM extends IViewItem<T>> extends ItemsBuilder<T, VM> {

  updateItem(item: VM, index: number) {
    this._items[index].update(this.unwrap(item));
  }
}

export class ViewGroupItemsBuilder<T extends IBaseItem, VM extends IViewItem<T>> extends GroupItemsBuilder<T, VM> {

  updateItem(item: VM, index: number) {
    this._items[index].update(this.unwrap(item));
  }
}
