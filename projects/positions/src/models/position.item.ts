import { Id } from 'base-components';
import {
  AddClassStrategy,
  Cell,
  DataCell,
  HoverableItem,
  IconCell,
  IFormatter,
  NumberCell, PriceFormatter,
  ProfitClass
} from 'data-grid';
import { calculatePL } from 'dom';
import { compareInstruments, IInstrument, IPosition, Side, TradePrint } from 'trading';

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

enum PositionStatus {
  InProfit = 'inProfit',
  Loss = 'loss',
  None = ''
}

const allColumns = Object.keys(PositionColumn) as PositionColumn[];

type IPositionItem = {
  [key in PositionColumn]: Cell;
};

export class PositionItem extends HoverableItem implements IPositionItem {
  private _priceFormatter: IFormatter = new PriceFormatter(2);

  account = new DataCell({ withHoverStatus: true });
  instrumentName = new DataCell({ withHoverStatus: true });
  exchange = new DataCell({ withHoverStatus: true });
  price = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  size = new NumberCell({ withHoverStatus: true, ignoreZero: false });
  unrealized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true,
    ignoreZero: false,
    formatter: this._priceFormatter,
  });
  realized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true,
    ignoreZero: false,
    formatter: this._priceFormatter,
  });
  total = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    withHoverStatus: true,
    formatter: this._priceFormatter,
    ignoreZero: false
  });
  close = new IconCell({ withHoverStatus: true, size: 10 });
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
    this.update(position);
  }

  update(position: IPosition) {
    this.position = { ...this.position, ...position };
    this.account.updateValue(position.accountId);
    this.instrumentName.updateValue(this.position.instrument?.symbol);
    this.exchange.updateValue(this.position.instrument?.exchange);
    this.price.updateValue(this.position.price);

    const fields: PositionColumn[] = [
      PositionColumn.price,
      PositionColumn.size,
      PositionColumn.instrumentName,
      PositionColumn.unrealized,
      PositionColumn.realized,
      PositionColumn.side
    ];
    for (let key of fields) {
      this[key].updateValue(position[key]);
    }

    this._updateTotal();
    const iconClass = position.side !== Side.Closed ? 'icon-close-window' : 'd-none';
    this.close.updateClass(iconClass);
    this._updateCellProfitStatus(this.unrealized);
    this._updateCellProfitStatus(this.realized);
    this._updateCellProfitStatus(this.total);
  }

  public updateUnrealized(trade: TradePrint, instrument: IInstrument) {
    const position = this.position;

    if (position == null || !compareInstruments(trade?.instrument, position?.instrument))
      return;

    const unrealized = calculatePL(position, trade.price, instrument.tickSize, instrument.contractSize);
    this.unrealized.updateValue(unrealized ?? 0);
    this._updateTotal();
    this._updateCellProfitStatus(this.unrealized);
    this._updateCellProfitStatus(this.total);
  }

  private _updateTotal(): void {
    this.total.updateValue(this.realized.numberValue + this.unrealized.numberValue);
  }

  private _updateCellProfitStatus(cell: Cell): void {
    let status = PositionStatus.None;

    if (cell.class === ProfitClass.DOWN)
      status = PositionStatus.Loss;
    else if (cell.class === ProfitClass.UP)
      status = PositionStatus.InProfit;
    cell.changeStatus(status);
  }

  protected _getPropertiesForHover(): string[] {
    return allColumns;
  }
}
