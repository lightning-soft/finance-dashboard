import { IBaseItem } from 'communication';
import { IItemsBuilder, IItemsBuilderParams } from './items.builder';
import { IViewItem, ViewItemsBuilder } from './view-items.builder';

interface IViewFilterItemsBuilderParams<Item, ViewItem> extends IItemsBuilderParams<Item, ViewItem> {
  viewItemsFilter?: (viewItem: ViewItem) => boolean;
}

interface IViewFilterItemsBuilder<Item, ViewItem> extends IItemsBuilder<Item, ViewItem> {
  setParams(params: IViewFilterItemsBuilderParams<Item, ViewItem>);

  refilterViewItems(): void;
}

export class ViewFilterItemsBuilder<T extends IBaseItem, VM extends IViewItem<T>>
  extends ViewItemsBuilder<T, VM> implements IViewFilterItemsBuilder<T, VM> {
  private _filteredItems: VM[] = [];

  protected _params: IViewFilterItemsBuilderParams<T, VM> = {
    order: 'asc',
  };

  get items(): VM[] {
    return this._filteredItems;
  }

  setParams(params: IViewFilterItemsBuilderParams<T, VM>) {
    super.setParams(params);
    this.refilterViewItems();
  }

  refilterViewItems(): void {
    const { viewItemsFilter } = this._params;
    this._filteredItems = viewItemsFilter ? this._items.filter(viewItemsFilter) : this._items;
  }

  replaceItems(items: T[]) {
    super.replaceItems(items);
    this.refilterViewItems();
  }

  addItems(items: T[]) {
    super.addItems(items);
    this.refilterViewItems();
  }

  removeWhere(filter: (item: VM) => boolean) {
    super.removeWhere(filter);
    this.refilterViewItems();
  }

  handleUpdateItems(items: T[]) {
    super.handleUpdateItems(items);
    this.refilterViewItems();
  }

  handleDeleteItems(items: T[]) {
    super.handleDeleteItems(items);
    this.refilterViewItems();
  }
}
