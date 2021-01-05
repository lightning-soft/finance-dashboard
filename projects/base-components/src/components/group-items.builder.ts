import { IBaseItem } from 'communication';
import { ItemsBuilder, IItemsBuilder, IItemsBuilderParams } from './items.builder';

export interface IGroupItemsBuilder<Item, ViewItem> extends IItemsBuilder<Item, ViewItem> {
  setParams(params: IGroupItemsBuilderParams<Item, ViewItem>);
  getItems(groupKey?: string, groupValue?: string): ViewItem[];
  groupItems(groupBy: string, groupItemMap: (item: string) => any);
  ungroupItems();
}

export interface IGroupItemsBuilderParams<T, VM> extends IItemsBuilderParams<T, VM> {
  groupBy?: string[];
}

type IGroupItemsBuilderGroups<T> = {
  [key: string]: {
    [key: string]: T[],
  },
};

export class GroupItemsBuilder<T extends IBaseItem, VM extends IBaseItem = T>
  extends ItemsBuilder<T, VM> implements IGroupItemsBuilder<T, VM> {

  get items(): VM[] {
    return !this._groupItemsParams ? this._items : this._groupedItems;
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
    this._groupedItems = [];

    const group = this._groups[groupBy];

    if (!group) {
      return;
    }

    Object.entries(group).forEach(([item, items]) => {
      this._groupedItems = this._order([
        this._groupedItems,
        [groupItemMap(item), ...items],
      ]);
    });
  }

  ungroupItems() {
    this._groupItemsParams = null;
    this._groupedItems = [];
  }

  replaceItems(items: T[]) {
    this._groups = {};

    super.replaceItems(items);

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

    _items = this.wrap(_items);

    return _items;
  }

  protected _buildGroups(items: T[]) {
    const {groupBy} = this._params;

    if (!groupBy.length) {
      return;
    }

    groupBy.forEach(key => {
      const group = this._groups[key] || {};

      items.forEach((item) => {
        const value = item[key];

        group[value] = this._order([
          ...(group[value] || []),
          this.wrap(item),
        ]);
      });

      this._groups[key] = group;
    });
  }
}
