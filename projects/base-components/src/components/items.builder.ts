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
  sort?: (a: T, b: T) => number;
  wrap?: (item: T) => VM;
  unwrap?: (item: VM) => T;
  addNewItems?: 'start' | 'end';
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

  replaceViewItems(items: VM[]) {
    this._items = items;
  }

  replaceViewItem(newItem: VM, oldItem: VM) {
    const index = this._items.findIndex((item) => item.id === oldItem.id);
    if (index !== -1)
      this._items.splice(index, 1, newItem);
  }

  addViewItems(items: VM[], index = this._items.length) {
    if (!Array.isArray(items) || !items.length)
      return;

    items = items.filter(i => this.items.every(item => item.id !== i.id));
    this._items.splice(index, 0, ...items);
    this._items = [...this._items];
  }

  removeViewModel(item: VM) {
    this._items = this._items.filter(vm => item.id !== vm.id);
  }
  removeViewModels(items: VM[]) {
    this._items = this._items.filter(vm => !items.some(item => item.id === vm.id));
  }


  addItems(items: T[]) {
    let data;
    const filteredItems = items.filter(item => !this.items.some(i => i.id === item.id));

    if (this._params.addNewItems === 'start') {
      data = [...this._handle(filteredItems), ...this._items];
    } else {
      data = [...this._items, ...this._handle(filteredItems)];
    }
    this._items = this._order(data);
  }

  removeWhere(filter: (item: VM) => boolean) {
    this._items = this._items.filter(i => !filter(i));
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

  protected _sort(items: T[]): T[] {
    const { sort } = this._params;

    return sort ? items.sort(sort) : items;
  }

  protected _order(items: any[]): any[] {
    items = this._sort(items);
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

    _items = this._order(_items);

    return this.wrap(_items);
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

  deleteItems(items: VM | VM[]) {
    if (Array.isArray(items))
      return items.forEach(i => this.deleteItems(i));

    const index = this.items.indexOf(items);

    if (index === -1)
      return;

    this.items.splice(index, 1);
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
