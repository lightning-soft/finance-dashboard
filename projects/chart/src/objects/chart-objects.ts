import { Injector } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { IBaseItem, Id, IPaginationResponse, RealtimeAction, Repository } from 'communication';
import { Subscription } from 'rxjs';
import { IChart } from '../models';

export abstract class ChartObjects<T extends IBaseItem> {
  protected _instance: any;
  protected _repository: Repository<T>;
  protected _accountsManager: AccountsManager;
  protected _barsMap: any = {};
  protected _repositorySubscription: Subscription;

  protected get _chart(): IChart {
    return this._instance.chart;
  }

  protected get _injector(): Injector {
    return this._instance.injector;
  }

  protected get _params(): any {
    const { accountId, instrument } = this._instance;

    return { accountId, instrument: instrument.id };
  }

  constructor(instance: any) {
    this._instance = instance;
    this._accountsManager = this._injector.get(AccountsManager);
  }

  init() {
    this._subscribeToConnections();
  }

  refresh() {
    this._deleteItems();
    this._loadItems();
  }

  protected _subscribeToConnections() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this._instance))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();

        this._repositorySubscription?.unsubscribe();

        if (connection) {
          const repository = this._repository as any;

          if (repository?.forConnection) {
            this._repository = repository.forConnection(connection);

            this._repositorySubscription = this._subscribeToRepository();
          }

          this._loadItems();
        } else {
          this._deleteItems();
        }
      });
  }

  protected _subscribeToRepository(): Subscription {
    if (!this._repository) {
      return;
    }

    return this._repository.actions
      .pipe(untilDestroyed(this._instance))
      .subscribe(({ action, items }) => {
        items.forEach(item => {
          switch (action) {
            case RealtimeAction.Create:
              this.create(item);
              break;
            case RealtimeAction.Update:
              this.update(item);
              break;
            case RealtimeAction.Delete:
              this.delete(item.id);
              break;
          }
        });
      });
  }

  protected _loadItems() {
    if (!this._instance.accountId || !this._instance.instrument) {
      return;
    }
    console.log(this._instance.instrument);

    this._repository.getItems(this._params)
      .pipe(untilDestroyed(this._instance))
      .subscribe((res: IPaginationResponse<T>) => {
        res.data.forEach(item => {
          this.create(item);
        });
      });
  }

  protected _deleteItems() {
    Object.keys(this._barsMap).forEach(key => {
      this.delete(key);
    });
  }

  abstract create(item: T);
  abstract update(item: T);

  delete(id: Id) {
    this._barsMap[id]?.remove();
    delete this._barsMap[id];
  }

  protected _create(item: T, fn: (item: any) => {}) {
    if (!this._isValid(item)) {
      return;
    }

    const bar = fn(this._map(item));

    this._chart.chartPanels[0].addObjects(bar);

    this._barsMap[item.id] = bar;
  }

  protected _update(item: T, fn: (item: any) => {}) {
    const bar = this._barsMap[item.id];

    if (!bar) {
      this.create(item);
      return;
    }

    if (!this._isValid(item)) {
      this.delete(item.id);
      return;
    }

    Object.assign(bar, fn(this._map(item)));

    this._chart.setNeedsUpdate();
  }

  protected _isValid(item: T): boolean {
    return true;
  }

  protected _map(item: T): any {
    return item;
  }
}
