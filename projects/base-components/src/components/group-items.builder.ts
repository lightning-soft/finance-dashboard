import { IBaseItem } from 'communication';
import { GenericItemsBuilder, IItemsBuilder, IItemsBuilderParams } from './items.builder';

export interface IGroupItemsBuilder<Item, ViewItem> extends IItemsBuilder<Item, ViewItem> {
  getItems(groupKey?: string, groupValue?: string);
  groupItems(groupBy: string, groupItemMap: (item: string) => any);
  ungroupItems();
}

export interface IGroupItemsBuilderParams<T> extends IItemsBuilderParams<T> {
  groupBy?: string[];
}

type IGroupItemsBuilderGroups = {
  [key: string]: {
    [key: string]: IBaseItem[],
  },
};

interface IGroupItemsBuilderGroupParams {
  groupBy: string;
  groupItemMap: (item: string) => any;
}

export class GroupItemsBuilder extends GenericItemsBuilder implements IGroupItemsBuilder<IBaseItem, IBaseItem> {
  items: IBaseItem[] = [];

  protected _groups: IGroupItemsBuilderGroups = {};
  protected _groupParams: IGroupItemsBuilderGroupParams = null;
  protected _params: IGroupItemsBuilderParams<IBaseItem> = {
    groupBy: [],
    order: 'asc',
  };

  setParams(params: IGroupItemsBuilderParams<IBaseItem>) {
    super.setParams(params);
  }

  getItems(groupKey: string = null, groupValue: string = null): IBaseItem[] {
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
    this.items = [];

    Object.entries(this._groups[groupBy]).forEach(([item, items]) => {
      this.items = [...this.items, groupItemMap(item), ...items];
    });

    this._groupParams = { groupBy, groupItemMap };
  }

  ungroupItems() {
    super._buildItems();

    this._groupParams = null;
  }

  protected _buildItems() {
    super._buildItems();

    this._buildGroups();
  }

  protected _buildGroups() {
    const { groupBy } = this._params;

    if (groupBy.length) {
      this._groups = {};

      groupBy.forEach(key => {
        this._groups[key] = this.items.reduce((accum, item) => {
          const value = item[key];
          if (value == null)
            return accum;

          const _value = typeof value === 'object' ? value.value : value;
          const _accum = accum[_value] || [];

          accum[_value] = [..._accum, item];

          return accum;
        }, {});
      });
    }

    if (this._groupParams) {
      this.groupItems(
        this._groupParams.groupBy,
        this._groupParams.groupItemMap,
      );
    }
  }
}
