import { StringHelper } from 'base-components';
import { IPosition, PositionsRepository, Side } from 'trading';
import { ChartObjects } from './chart-objects';

declare const StockChartX: any;

const { uncapitalize } = StringHelper;

export class Positions extends ChartObjects<IPosition> {
  protected _repository = this._injector.get(PositionsRepository);

  init() {
    super.init();
    this._chart.on(StockChartX.PositionBarEvents.CLOSE_POSITION_CLICKED, this._closePosition);
  }
  _closePosition =  ({ value }) => {
    this._repository.deleteItem(value.position).subscribe(
      () => value.remove(),
      err => console.error(err),
    );
  }
  destroy() {
    super.destroy();
    this._chart?.off(StockChartX.PositionBarEvents.CLOSE_POSITION_CLICKED, this._closePosition);
  }

  create(item: IPosition) {
    this._create(item, position => {
      const positionBar = new StockChartX.PositionBar({ position });

      positionBar.locked = true;

      return positionBar;
    });
  }

  update(item: IPosition) {
    this._update(item, position => ({ position }));
  }

  protected _isValid(item: IPosition) {
    return item.side !== Side.Closed;
  }

  protected _map(item: IPosition) {
    return {
      id: item.id,
      quantity: item.size,
      price: item.price,
      kind: uncapitalize(item.side),
      accountId: item.accountId,
      instrument: item.instrument,
    };
  }
}
