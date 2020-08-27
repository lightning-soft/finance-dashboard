import { IIdObject } from '../models';
import { IItemsBuilder, GenericItemsBuilder } from './items.builder';

export interface IViewItem<T> extends IIdObject {
    update(item: T);
}

export abstract class ViewItemsBuilder<T extends IIdObject, VM extends IViewItem<T>>
    extends GenericItemsBuilder implements IItemsBuilder<T, VM> {
    items: VM[] = [];

    protected abstract _cast(item: T): VM;
    protected _castItems(items: T[]): VM[] {
        return items.map((i) => this._cast(i));
    }

    replaceItems(items: T[]) {
        return super.replaceItems(this._castItems(items));
    }

    addItems(items: T[]) {
        return super.addItems(this._castItems(items));
    }

    handleUpdateItems(items: T[]) {
        if (this._isNotArray(items))
            return;

        for (const item of items) {
            const vmItem = this._itemsMap.get(item.id);
            if (vmItem)
                vmItem.updadte(item)
        }
    }

    handleCreateItems(items: T[]) {
        return super.handleCreateItems(this._castItems(items));
    }

    handleDeleteItems(items: T[]) {
        return super.handleDeleteItems(items);
    }
}
