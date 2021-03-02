import { StringHelper } from 'base-components';
import { IPosition, PositionsFeed, PositionsRepository, Side } from 'trading';
import { ChartObjects } from './chart-objects';
import { RealPositionsRepository } from 'real-trading';

declare const StockChartX: any;

const { uncapitalize } = StringHelper;

export class Positions extends ChartObjects<IPosition> {
  protected _repository = this._injector.get(PositionsRepository);
  protected _dataFeed = this._injector.get(PositionsFeed) as any;

  init() {
    super.init();
    this._chart.on(StockChartX.PositionBarEvents.CLOSE_POSITION_CLICKED, this._closePosition);
  }

  handle(model: IPosition) {
    const position = model.id ? model : RealPositionsRepository.transformPosition(model);
    super.handle(position);
  }

  createBar(model) {
    return new StockChartX.PositionBar({
      position: this._map(model),
    });
  }

  _closePosition = ({ value }) => {
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
      id: item.id,
      quantity: item.size,
      price: item.price,
      kind: uncapitalize(item.side),
      accountId: item.accountId,
      instrument: item.instrument,
    };
  }
}
