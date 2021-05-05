import { Id, HoverableItem } from 'base-components';
import {
  AddClassStrategy,
  Cell,
  DataCell,
  IconCell,
  IFormatter,
  NumberCell,
  ProfitClass,
  RoundFormatter
} from 'data-grid';
import { IPosition, Side, TradePrint } from 'trading';

export enum PositionColumn {
  account = 'account',
  instrumentName = 'instrumentName',
  exchange = 'exchange',
  price = 'price',
  size = 'size',
  unrealized = 'unrealized',
  realized = 'realized',
  total = 'total',
  close = 'close',
  side = 'side',
}

const allColumns = Object.keys(PositionColumn) as PositionColumn[];

type IPositionItem = {
  [key in PositionColumn]: Cell;
};

export class PositionItem extends HoverableItem implements IPositionItem {
  private _priceFormatter: IFormatter;

  account = new DataCell({ withHoverStatus: true });
  instrumentName = new DataCell({ withHoverStatus: true });
  exchange = new DataCell({ withHoverStatus: true });
  price = new NumberCell({ withHoverStatus: true });
  size = new NumberCell({ withHoverStatus: true });
  unrealized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true
  });
  realized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true
  });
  total = new NumberCell({ withHoverStatus: true });
  close = new IconCell({ withHoverStatus: true });
  side = new DataCell({ withHoverStatus: true });
  position: IPosition;

  get id(): Id | undefined {
    return this.position && this.position.id;
  }

  constructor(position?: IPosition) {
    super();
    if (!position) {
      return;
    }
    this._priceFormatter = new RoundFormatter(position.instrument?.precision ?? 2);
    this.price.formatter = this._priceFormatter;
    this.unrealized.formatter = this._priceFormatter;
    this.realized.formatter = this._priceFormatter;
    this.total.formatter = this._priceFormatter;
    this.update(position);
  }

  update(position: IPosition) {
    this.position = { ...this.position, ...position };
    this.account.updateValue(position.accountId);
    this.instrumentName.updateValue(this.position.instrument.symbol);
    this.exchange.updateValue(this.position.instrument.exchange);

    const fields: PositionColumn[] = [
      PositionColumn.price,
      PositionColumn.size,
      PositionColumn.instrumentName,
      PositionColumn.unrealized,
      PositionColumn.realized,
      PositionColumn.total,
      PositionColumn.side
    ];
    for (let key of fields) {
      this[key].updateValue(position[key]);
    }

    const iconClass = position.side !== Side.Closed ? 'icon-close-window' : 'd-none';
    this.close.updateClass(iconClass);
    this._updateCellProfitStatus(this.unrealized);
    this._updateCellProfitStatus(this.realized);
  }

  public updateUnrealized(trade: TradePrint) {
    if (this.position == null || trade.instrument.symbol != this.position.instrument.symbol)
      return;
    const currentPrice = +this.price.value;
    const { volume, price } = trade;
    switch (this.side.value) {
      case Side.Long:
        this.unrealized.updateValue(this._calculateLongUnrealized(currentPrice, volume, price));
        break;

      case Side.Short:
        this.unrealized.updateValue(this._calculateShortUnrealized(currentPrice, volume, price));
        break;
    }

    this._updateCellProfitStatus(this.unrealized);
  }

  private _calculateLongUnrealized(currentPrice: number, volume: number, price: number): number {
    return ((currentPrice * volume) - (price * volume));
  }

  private _calculateShortUnrealized(currentPrice: number, volume: number, price: number): number {
    return ((price * volume) - (currentPrice * volume));
  }

  private _updateCellProfitStatus(cell: Cell): void {
    let status = '';

    if (cell.class === ProfitClass.DOWN)
      status = 'loss';
    else if (cell.class === ProfitClass.UP)
      status = 'inProfit';
    cell.changeStatus(status);
  }

  protected _getCellsToHover(): Cell[] {
    return allColumns.map((field) => this[field]);
  }
}


