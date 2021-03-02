import { Injector } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { IBaseItem, Id, IPaginationResponse, RealtimeAction, Repository } from 'communication';
import { Subscription } from 'rxjs';
import { IChart } from '../models';
import { NotifierService } from 'notifier';
import { Feed, IInstrument } from 'trading';

export abstract class ChartObjects<T extends IBaseItem & { instrument?: IInstrument }> {
  protected _instance: any;
  protected _repository: Repository<T>;
  protected _notifier: NotifierService;
  protected _accountsManager: AccountsManager;
  protected _barsMap: any = {};
  protected _repositorySubscription: Subscription;
  protected _dataFeed: Feed<T>;
  unsubscribeFn: () => void;

  protected get _chart(): IChart {
    return this._instance.chart;
  }

  protected get _injector(): Injector {
    return this._instance.injector;
  }

  protected get _params(): any {
    const { accountId, instrument } = this._instance;

    return { accountId, instrument };
  }

  constructor(instance: any) {
    this._instance = instance;
    this._accountsManager = this._injector.get(AccountsManager);
    this._notifier = this._injector.get(NotifierService);
  }

  init() {
    this._subscribeToConnections();
    this.unsubscribeFn = this._dataFeed.on((model) => {
      this.handle(model);
    });
  }

  handle(model: T){
    if (model?.instrument?.symbol !== this._instance.instrument.symbol) {
      return;
    }
    if (!this._barsMap[model.id]) {
      const bar = this.createBar(model);
      bar.chartPanel = this._chart.mainPanel;
      bar.locked = true;
      this._chart.mainPanel.addObjects(bar);
      this._barsMap[model.id] = bar;
    } else {
      const orderBar = this._barsMap[model.id];
      orderBar.order = this._map(model);
      orderBar.locked = true;
      orderBar.update(false);
    }
    if (!this._isValid(model)) {
      this.delete(model.id);
    }
  }
  abstract createBar(model);

  refresh() {
    this._deleteItems();
    this._loadItems();
  }

  destroy() {
    if (this.unsubscribeFn)
      this.unsubscribeFn();
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
          }
          this._loadItems();
        } else {
          this._deleteItems();
        }
      });
  }

  protected _loadItems() {
    if (!this._instance.accountId || !this._instance.instrument) {
      return;
    }

    this._repository.getItems(this._params)
      .pipe(untilDestroyed(this._instance))
      .subscribe((res: IPaginationResponse<T>) => {
        res.data.forEach(item => {
          this.handle(item);
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
