import { IBaseItem } from 'communication';
import { IItemsBuilder, IItemsBuilderParams, ItemsBuilder } from 'base-components';

interface IViewFilterItemsBuilderParams<Item, ViewItem> extends IItemsBuilderParams<Item, ViewItem> {
  viewItemsFilter?: (viewItem: ViewItem) => boolean;
}

interface IViewFilterItemsBuilder<Item, ViewItem> extends IItemsBuilder<Item, ViewItem> {
  setParams(params: IViewFilterItemsBuilderParams<Item, ViewItem>);

  refilterViewItems(): void;
}

export class ViewFilterItemsBuilder<T extends IBaseItem, VM extends IBaseItem = T>
  extends ItemsBuilder<T, VM> implements IViewFilterItemsBuilder<T, VM> {
  private _filteredItems: VM[] = [];

  protected _params: IViewFilterItemsBuilderParams<T, VM> = {
    order: 'asc',
  };

  get items(): VM[] {
    return this._filteredItems;
  }

  constructor(params?: IViewFilterItemsBuilderParams<T, VM>) {
    super(params);
  }

  setParams(params: IViewFilterItemsBuilderParams<T, VM>) {
    super.setParams(params);
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

  handleUpdateItems(items: T[]) {
    super.handleUpdateItems(items);
    this.refilterViewItems();
  }

  updateItem(item: VM, index: number) {
    super.updateItem(item, index);
    this.refilterViewItems();
  }

  handleCreateItems(items: T[]) {
    super.handleCreateItems(items);
    this.refilterViewItems();
  }

  handleDeleteItems(items: T[]) {
    this.handleDeleteItems(items);
  }
}
