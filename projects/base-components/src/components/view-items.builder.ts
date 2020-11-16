import { IBaseItem } from 'communication';
import { GenericItemsBuilder, IItemsBuilder } from './items.builder';

export interface IViewItem<T> extends IBaseItem {
  update(item: T);
}

export class ViewItemsBuilder<T extends IBaseItem, VM extends IViewItem<T>>
  extends GenericItemsBuilder implements IItemsBuilder<T, VM> {
  items: VM[] = [];

  handleUpdateItems(items: T[]) {
    if (this._isNotArray(items))
      return;

    try {
      for (const item of items) {
        const viewItem = this.items.find(i => i.id === item.id);
        if (!viewItem)
          continue;

        viewItem.update(item);
      }
    } catch (e) {
      console.error('error', e);
    }
  }
}
