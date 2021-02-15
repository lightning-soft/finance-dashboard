import { Directive, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IBaseItem, IPaginationParams } from 'communication';
import { IQuote, Level1DataFeed, OnTradeFn } from 'trading';
import { ItemsComponent } from './items.component';

@UntilDestroy()
@Directive()
export class RealtimeItemsComponent<T extends IBaseItem, P extends IPaginationParams = any>
  extends ItemsComponent<T, P> implements OnInit, OnDestroy {

  protected _dataFeed: any;
  protected _levelOneDataFeed: Level1DataFeed;
  protected _levelOneDataFeedHandler: OnTradeFn<IQuote>;

  ngOnInit() {
    super.ngOnInit();

    this._subscribeToDataFeed();

    this._levelOneDataFeed = this._injector.get(Level1DataFeed);

    this._onLevelOneDataFeed();
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this._unsubscribeFromLevelOneDataFeed(this.items);
  }

  protected _subscribeToDataFeed() {
    if (!this._dataFeed) {
      return;
    }

    this._dataFeed.on((item: T) => {
      console.log(this._dataFeed.type, item);

      const oldItem = this.items.find(i => i.id === item.id);

      if (oldItem) {
        const _oldItem = this.builder.unwrap(oldItem);

        this._handleUpdateItems([this._dataFeed.merge(_oldItem, item)]);
      } else {
        this._handleCreateItems([item]);
      }
    });
  }

  protected _onLevelOneDataFeed() {
    if (!this._levelOneDataFeedHandler) {
      return;
    }

    this._levelOneDataFeed.on(this._levelOneDataFeedHandler.bind(this));
  }

  protected _subscribeToLevelOneDataFeed(items: T[]) {
    if (!this._levelOneDataFeedHandler) {
      return;
    }

    items.forEach(item => {
      this._levelOneDataFeed.subscribe((item as any).instrument);
    });
  }

  protected _unsubscribeFromLevelOneDataFeed(items: T[]) {
    if (!this._levelOneDataFeedHandler) {
      return;
    }

    items.forEach(item => {
      this._levelOneDataFeed.unsubscribe((item as any).instrument);
    });
  }

  protected _handleCreateItems(items: T[]) {
    super._handleCreateItems(items);

    this._subscribeToLevelOneDataFeed(items);
  }

  protected _handleDeleteItems(items: T[]) {
    super._handleDeleteItems(items);

    this._unsubscribeFromLevelOneDataFeed(items);
  }
}
