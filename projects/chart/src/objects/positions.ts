import { StringHelper } from 'base-components';
import { compareInstruments, IPosition, PositionsFeed, PositionsRepository, Side } from 'trading';
import { ChartObjects } from './chart-objects';
import { RealPositionsRepository } from 'real-trading';
import { ChangeDetectorRef } from "@angular/core";

declare const StockChartX: any;

const { uncapitalize } = StringHelper;

export class Positions extends ChartObjects<IPosition> {
  protected _repository = this._injector.get(PositionsRepository);
  protected _dataFeed = this._injector.get(PositionsFeed) as any;
  protected _cd = this._injector.get(ChangeDetectorRef);

  init() {
    super.init();
    this._chart.on(StockChartX.PositionBarEvents.CLOSE_POSITION_CLICKED, this._closePosition);
  }

  handle(model: IPosition) {
    const position = model.id ? model : RealPositionsRepository.transformPosition(model);
    super.handle(position);
    this._onDataLoaded();
    requestAnimationFrame(this.markForCheck);
  }

  markForCheck = () => {
    this._cd.markForCheck();
  }

  protected _onDataLoaded() {
    super._onDataLoaded();
    this._instance.position = this.items.find(item => compareInstruments(item.instrument, this._instance.instrument));
  }

  createBar(model) {
    const bar = new StockChartX.PositionBar({
      position: this._map(model),
    });
    bar.visible = false;
    return bar;
  }

  shouldBarBeVisible() {
    return false;
  }

  getPositions() {
    return this.items;
  }

  private _closePosition = ({ value }) => {
    this._repository.deleteItem(value.position).subscribe(
      () => value.remove(),
      err => console.error(err),
    );
  }

  protected _isValid(item: IPosition) {
    return item.side !== Side.Closed;
  }

  protected _map(item: IPosition) {
    return {
      ...item,
      id: item.id,
      quantity: item.size,
      price: item.price,
      kind: uncapitalize(item.side),
      accountId: item.accountId,
      instrument: item.instrument,
    };
  }
}
