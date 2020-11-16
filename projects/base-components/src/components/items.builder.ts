import { IBaseItem } from 'communication';

export interface IItemsBuilder<Item, ViewItem> {
  items: ViewItem[];

  setParams(params: any);
  replaceItems(items: Item[]);
  addItems(items: Item[]);
  handleUpdateItems(items: Item[]);
  handleCreateItems(item: Item[]);
  handleDeleteItems(item: Item[]);
}

export interface IItemsBuilderParams<T> {
  order?: 'asc' | 'desc';
  filter?: (item: T) => boolean;
  map?: (item: T) => any;
}

export class GenericItemsBuilder implements IItemsBuilder<IBaseItem, IBaseItem> {
  items: IBaseItem[] = [];

  protected _items: IBaseItem[] = [];
  protected _params: IItemsBuilderParams<IBaseItem> = {
    order: 'asc',
  };

  setParams(params: IItemsBuilderParams<IBaseItem>) {
    this._params = { ...this._params, ...params };
  }

  replaceItems(items: IBaseItem[]) {
    this._items = this._map(items);
    this._buildItems();
  }

  addItems(items: IBaseItem[]) {
    this._items = [...this._items, ...this._map(items)];
    this._buildItems();
  }

  protected _map(items) {
    const { map } = this._params;

    return map ? items.map(map) : items;
  }

  protected _buildItems() {
    const { order, filter, map } = this._params;

    this.items = [...this._items];

    if (filter) {
      this.items = this.items.filter(filter);
    }

    // if (map) {
    //   this.items = this.items.map(map);
    // }

    if (order === 'desc') {
      this.items = this.items.reverse();
    }
  }

  protected _isNotArray(items): boolean {
    if (Array.isArray(items))
      return false;

    console.warn('Items should be array');
    return true;
  }

  handleUpdateItems(items: IBaseItem[]) {
    if (this._isNotArray(items))
      return;

    try {
      for (const item of items) {
        const index = this._items.findIndex(t => t.id === item.id);

        if (index !== -1) {
          const newValue = { ...this._items[index], ...item };
          this._items.splice(index, 1, newValue);
          this._buildItems();
        }
      }
    } catch (e) {
      console.error('error', e);
    }
  }

  handleCreateItems(items: IBaseItem[]) {
    if (this._isNotArray(items))
      return;

    try {
      items = items.filter(({ id }) => this._items.every(i => i.id !== id));
      this._items = [...this._items, ...this._map(items)];
      this._buildItems();
    } catch (e) {
      console.error('error', e);
    }
  }

  handleDeleteItems(items: IBaseItem[]) {
    if (this._isNotArray(items))
      return;

    const ids = items.map(item => (typeof item === 'object' ? item.id : item));
    this._items = this._items.filter(item => ids.every(id => item.id !== id));
    this._buildItems();
  }
}

export class ItemsBuilder<T extends IBaseItem> extends GenericItemsBuilder implements IItemsBuilder<T, T> {
  items: T[] = [];
}

export class PaginationBuilder<T extends IBaseItem> extends GenericItemsBuilder implements IItemsBuilder<T, T> {
  items: T[] = [];

  addItems(items: any[]) {
    this.replaceItems(items);
  }
}
