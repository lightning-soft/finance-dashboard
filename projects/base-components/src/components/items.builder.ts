import { IBaseItem } from 'communication';

export interface IItemsBuilder<Item, ViewItem = Item> {
  items: ViewItem[];

  setParams(params: IItemsBuilderParams<Item, ViewItem>);
  replaceItems(items: Item[]);
  addItems(items: Item[]);
  wrap(data: Item | Item[]);
  unwrap(data: ViewItem | ViewItem[]);
  handleUpdateItems(items: Item[]);
  handleCreateItems(item: Item[]);
  handleDeleteItems(item: Item[]);
}

export interface IItemsBuilderParams<T, VM> {
  order?: 'asc' | 'desc';
  filter?: (item: T) => boolean;
  wrap?: (item: T) => VM;
  unwrap?: (item: VM) => T;
}

export class ItemsBuilder<T extends IBaseItem, VM extends IBaseItem = T> implements IItemsBuilder<T, VM> {
  get items(): VM[] {
    return this._items;
  }

  protected _items: VM[] = [];

  protected _params: IItemsBuilderParams<T, VM> = {
    order: 'asc',
  };

  constructor(params?: IItemsBuilderParams<T, VM>) {
    if (params)
      this.setParams(params);
  }

  setParams(params: IItemsBuilderParams<T, VM>) {
    this._params = { ...this._params, ...params };
  }

  replaceItems(items: T[]) {
    this._items = this._handle(items);
  }

  addItems(items: T[]) {
    this._items = this._order([this._items, this._handle(items)]);
  }

  wrap(data: T | T[]): any {
    const { wrap } = this._params;

    if (!wrap) {
      return data;
    }

    return Array.isArray(data) ? data.map(wrap) : wrap(data);
  }

  unwrap(data: VM | VM[]): any {
    const { unwrap } = this._params;

    if (!unwrap) {
      return data;
    }

    return Array.isArray(data) ? data.map(unwrap) : unwrap(data);
  }

  protected _filter(items: T[]): T[] {
    const { filter } = this._params;

    return filter ? items.filter(filter) : items;
  }

  protected _order(items: any[]): any[] {
    const _items = (() => {
      switch (this._params.order) {
        case 'asc':
          return items;
        case 'desc':
          return items.reverse();
      }
    })();

    return _items.reduce((accum, item) => accum.concat(item), []);
  }

  protected _handle(items: T[], skipFilter = false): any[] {
    let _items = items;

    if (!skipFilter) {
      _items = this._filter(_items);
    }

    _items = this.wrap(_items);
    _items = this._order(_items);

    return _items;
  }

  protected _isNotArray(items: any[]): boolean {
    if (Array.isArray(items))
      return false;

    console.warn('Items should be array');
    return true;
  }

  handleUpdateItems(items: T[]) {
    this._handleItems(items, () => {
      const { filter } = this._params;

      const _items = this._handle(items, true);

      for (const item of _items) {
        const isValidItem = !filter || filter(item);
        const index = this._items.findIndex(t => t.id === item.id);

        if (index !== -1) {
          if (isValidItem) {
            this.updateItem(item, index);
          } else {
            this._items.splice(index, 1);
          }
        } else if (isValidItem) {
          this._items = this._order([this._items, item]);
        }
      }
    });
  }

  updateItem(item: VM, index: number) {
    const newValue = { ...this._items[index], ...item };
    this._items.splice(index, 1, newValue);
  }

  handleCreateItems(items: T[]) {
    this._handleItems(items, () => {
      items = items.filter(({ id }) => this._items.every(i => i.id !== id));

      this.addItems(items);
    });
  }

  handleDeleteItems(items: T[]) {
    this._handleItems(items, () => {
      const ids = items.map(item => (typeof item === 'object' ? item.id : item));

      this._items = this._items.filter(item => ids.every(id => item.id !== id));
    });
  }

  protected _handleItems(items: T[], fn: (items: T[]) => void) {
    if (this._isNotArray(items))
      return;

    try {
      fn(items);
    } catch (e) {
      console.error('error', e);
    }
  }
}

export class PaginationBuilder<T extends IBaseItem, VM extends IBaseItem = T> extends ItemsBuilder<T, VM> {

  addItems(items: T[]) {
    this.replaceItems(items);
  }
}
