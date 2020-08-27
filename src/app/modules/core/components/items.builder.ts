import { IIdObject } from '../models';

export interface IItemsBuilder<Item, ViewItem> {
    items: ViewItem[];

    replaceItems(items: Item[]);
    addItems(items: Item[]);
    handleUpdateItems(items: Item[]);
    handleCreateItems(item: Item[]);
    handleDeleteItems(item: Item[]);
}

export class GenericItemsBuilder implements IItemsBuilder<IIdObject, IIdObject> {
    items: IIdObject[] = [];

    protected _itemsMap = new Map();
    constructor(protected _useMap = false) { }

    replaceItems(items: IIdObject[]) {
        this.items = items;
        this._itemsMap.clear();
        this._addToMap(items);
    }

    addItems(items: IIdObject[]) {
        this.items = [...items, ...this.items];
        this._addToMap(items);
    }

    protected _addToMap(items: IIdObject[]) {
        if (!this._useMap)
            return;

        for (const item of items)
            this._itemsMap.set(item.id, item);
    }

    protected _isNotArray(items): boolean {
        if (Array.isArray(items))
            return false;

        console.warn('Items should be array');
        return true;
    }

    handleUpdateItems(items: IIdObject[]) {
        if (this._isNotArray(items))
            return;

        try {
            for (const item of items) {
                const index = this.items.findIndex(t => t.id === item.id);

                if (index !== -1) {
                    const newValue = { ...this.items[index], ...item };
                    this.items.splice(index, 1, newValue);
                    if (this._useMap) {
                        this._itemsMap.set(item.id, newValue);
                    }
                }
            }
        } catch (e) {
            console.error('error', e);
        }
    }

    handleCreateItems(items: IIdObject[]) {
        if (this._isNotArray(items))
            return;

        try {
            items = items.filter(({ id }) => items.every(i => i.id !== id));
            this.items = [...items, ...this.items];
            this._addToMap(items);
        } catch (e) {
            console.error('error', e);
        }
    }

    handleDeleteItems(items: IIdObject[]) {
        if (this._isNotArray(items))
            return;

        for (const item of items) {
            try {
                const itemId = (typeof item === 'object' ? item.id : item);
                const index = this.items.findIndex(t => t.id === itemId);

                if (index !== -1) {
                    this.items.splice(index, 1);
                    this._itemsMap.delete(itemId);
                }
            } catch (e) {
                console.error('error', e);
            }
        }
    }
}

export class ItemsBuilder<T extends IIdObject> extends GenericItemsBuilder implements IItemsBuilder<T, T> {
    items: T[] = [];
}
