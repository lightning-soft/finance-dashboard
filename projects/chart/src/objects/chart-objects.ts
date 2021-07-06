import { Injector } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { IBaseItem, Id, IPaginationResponse, Repository } from 'communication';
import { NotifierService } from 'notifier';
import { Feed, IInstrument } from 'trading';
import { ChartComponent } from '../chart.component';
import { IChart } from '../models';
import { filterByAccountAndInstrument } from "real-trading";

export abstract class ChartObjects<T extends IBaseItem & { instrument?: IInstrument }> {
  protected _instance: ChartComponent;
  protected _repository: Repository<T>;
  protected _notifier: NotifierService;
  protected _barsMap: any = {};
  protected _dataFeed: Feed<T>;
  private unsubscribeFn: () => void;
  items: T[] = [];

  protected get _chart(): IChart {
    return this._instance.chart;
  }

  protected get _injector(): Injector {
    return this._instance.injector;
  }

  protected get _params(): any {
    return {
      accountId: this._instance.accountId
    };
  }

  constructor(instance: any) {
    this._instance = instance;
    this._notifier = this._injector.get(NotifierService);
  }

  init() {
    this.unsubscribeFn = this._dataFeed.on(filterByAccountAndInstrument(this._instance,
      (item: any) => this.handle(item))
    );
  }

  handle(model: T) {
    const instrument = this._instance?.instrument;
    if (instrument == null || model?.instrument?.symbol !== instrument?.symbol) {
      return;
    }

    if (!this._barsMap[model.id]) {
      const bar = this.createBar(model);
      if (!this.items.some((item) => item.id === model.id))
        this.items = [...this.items, model];
      bar.visible = this.shouldBarBeVisible();
      bar.chartPanel = this._chart.mainPanel;
      this._chart.mainPanel.addObjects(bar);
      this._barsMap[model.id] = bar;
    } else {
      const orderBar = this._barsMap[model.id];
      orderBar.order = this._map(model);
      const index = this.items.findIndex(item => item.id === model.id);
      if (index !== -1)
        this.items[index] = model;
      orderBar.update(false);
    }

    if (!this._isValid(model)) {
      this.delete(model.id);
    }
  }

  shouldBarBeVisible() {
    return this._instance.enableOrderForm;
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

  protected _loadItems() {
    if (!this._instance.accountId) {
      return;
    }

    this._repository.getItems(this._params)
      .pipe(untilDestroyed(this._instance))
      .subscribe((res: IPaginationResponse<T>) => {
        this.items = res.data;
        res.data.forEach(item => {
          this.handle(item);
        });
        this._onDataLoaded();
      });
  }

  protected _onDataLoaded() {
  }

  protected _deleteItems() {
    Object.keys(this._barsMap).forEach(key => {
      this.delete(key);
    });
    this.items = [];
  }

  delete(id: Id) {
    this._barsMap[id]?.remove();
    this.items = this.items.filter(item => item.id !== id);
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

  protected _isValid(item: T): boolean {
    return true;
  }

  protected _map(item: T): any {
    return item;
  }
}
