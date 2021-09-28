import { IBaseItem } from 'communication';
import { IItemsBuilder, IItemsBuilderParams, ItemsBuilder } from './items.builder';

export interface IGroupItemsBuilder<Item, ViewItem> extends IItemsBuilder<Item, ViewItem> {
  setParams(params: IGroupItemsBuilderParams<Item, ViewItem>);
  getItems(groupKey?: string, groupValue?: string): ViewItem[];
  groupItems(groupBy: string, groupItemMap: (item: string) => any);
  ungroupItems();
}

export interface IGroupItemsBuilderParams<T, VM> extends IItemsBuilderParams<T, VM> {
  groupBy?: string[];
  viewItemsFilter?: (viewItem: VM) => boolean;
}

type IGroupItemsBuilderGroups<T> = {
  [key: string]: {
    [key: string]: T[],
  },
};

export class GroupItemsBuilder<T extends IBaseItem, VM extends IBaseItem = T>
  extends ItemsBuilder<T, VM> implements IGroupItemsBuilder<T, VM> {
  _filteredItems = [];

  get items(): VM[] {
    return !this._groupItemsParams ? this._filteredItems : this._groupedItems;
  }

  get allItems(): VM[] {
    const groupedValues = Object.values(this._groups).reduce((total, item) => {
      return [...total, ...flatArray(Object.values(item))];
    }, []);

    return [...this._items, ...groupedValues];
  }

  protected _groupItemsParams;
  protected _groupedItems: VM[] = [];

  protected _groups: IGroupItemsBuilderGroups<VM> = {};
  protected _params: IGroupItemsBuilderParams<T, VM> = {
    groupBy: [],
    order: 'asc',
  };

  setParams(params: IGroupItemsBuilderParams<T, VM>) {
    super.setParams(params);
    this._updateFiltered();
  }

  private _updateFiltered() {
    const { viewItemsFilter } = this._params;
    if (viewItemsFilter) {
      this._filteredItems = this._items.filter(viewItemsFilter);
    } else {
      this._filteredItems = this._items;
    }
  }

  removeWhere(filter: (item: VM) => boolean) {
    super.removeWhere(filter);
    this._updateFiltered();
    this.updateGroupedItems();
  }

  addItems(items: T[]) {
    super.addItems(items);
    this._updateFiltered();
    this.updateGroupedItems();
  }

  handleCreateItems(items: T[]) {
    super.handleCreateItems(items);
    this._updateFiltered();
  }

  handleDeleteItems(items: T[]) {
    super.handleDeleteItems(items);
    this._updateFiltered();
  }

  handleUpdateItems(items: T[]) {
    super.handleUpdateItems(items);
    this._updateFiltered();
  }

  getItems(groupKey: string = null, groupValue: string = null): VM[] {
    if (groupKey === null || groupValue === null) {
      return [];
    }

    const group = this._groups[groupKey];

    if (!group) {
      return [];
    }

    return group[groupValue] || [];
  }

  groupItems(groupBy: string, groupItemMap: (item: string) => any) {
    this._groupItemsParams = { groupBy, groupItemMap };
    this.updateGroupedItems();
    this._updateFiltered();
  }


  updateGroupedItems() {
    if (!this._groupItemsParams)
      return;

    const { groupBy, groupItemMap } = this._groupItemsParams;
    const { viewItemsFilter } = this._params;
    const group = this._groups[groupBy];

    if (!group) {
      return;
    }
    this._groupedItems = [];
    Object.entries(group).forEach(([item, items]) => {
      const _items = viewItemsFilter ? items.filter(viewItemsFilter) : items;
      if (_items.length) {
        this._groupedItems = this._order([
          this._groupedItems,
          [groupItemMap(item), ..._items],
        ]);
      }
    });
  }

  ungroupItems() {
    this._groupItemsParams = null;
    this._groupedItems = [];
  }

  replaceItems(items: T[]) {
    this._groups = {};

    super.replaceItems(items);
    this._updateFiltered();

    if (this._groupItemsParams) {
      this.groupItems(
        this._groupItemsParams.groupBy,
        this._groupItemsParams.groupItemMap,
      );
    }
  }

  updateGroupItems() {
    this.ungroupItems();
    this._groups = {};
    // #Todo think about something else
    this._buildGroups(this.items as any);
  }

  protected _handle(items: T[]): any[] {
    let _items = items;

    _items = this._filter(_items);
    _items = this._order(_items);

    this._buildGroups(_items);
    this.updateGroupedItems();

    _items = this.wrap(_items);
    this._updateFiltered();

    return _items;
  }

  protected _buildGroups(items: T[]) {
    const { groupBy } = this._params;

    if (!groupBy.length) {
      return;
    }

    groupBy.forEach(key => {
      const group = this._groups[key] || {};

      items.forEach((item) => {
        const value = item[key];
        const prevGroup = group[value] || [];

        const searchedIndex = prevGroup.findIndex(groupItem => item.id === groupItem.id);
        const shouldAddToGroup = !prevGroup.length || searchedIndex === -1;

        if (shouldAddToGroup) {
          group[value] = this._order([
            ...prevGroup,
            this.wrap(item),
          ]);
        }

        if (searchedIndex !== -1) {
          group[value][searchedIndex] = this.wrap(item);
        }
      });

      this._groups[key] = group;
    });
  }
}

function flatArray(arrays) {
  return [].concat.apply([], arrays);
}
