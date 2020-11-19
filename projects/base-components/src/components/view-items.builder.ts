import { IBaseItem } from 'communication';
import { GroupItemsBuilder } from './group-items.builder';
import { ItemsBuilder } from './items.builder';

export interface IViewItem<T> extends IBaseItem {
  update(item: T);
}

function handleUpdateItems<T extends IBaseItem>(items: T[]) {
  this._handleItems(items, () => {
    for (const item of items) {
      const viewItem = this.items.find(i => i.id === item.id);
      if (!viewItem)
        continue;

      viewItem.update(item);
    }
  });
}

export class ViewItemsBuilder<T extends IBaseItem, VM extends IViewItem<T>> extends ItemsBuilder<T, VM> {

  handleUpdateItems(items: T[]) {
    handleUpdateItems.call(this, items);
  }
}

export class ViewGroupItemsBuilder<T extends IBaseItem, VM extends IViewItem<T>> extends GroupItemsBuilder<T, VM> {

  handleUpdateItems(items: T[]) {
    handleUpdateItems.call(this, items);
  }
}
