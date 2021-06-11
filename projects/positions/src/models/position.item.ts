import { Id } from 'base-components';
import {
  AddClassStrategy,
  Cell, CellStatus, CellStatusGetter,
  DataCell, getProfitStatus,
  HoverableItem,
  IconCell,
  NumberCell, PriceFormatter,
  ProfitStatus,
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

const allColumns = Object.keys(PositionColumn) as PositionColumn[];

type IPositionItem = {
  [key in PositionColumn]: Cell;
};

export class PositionItem extends HoverableItem implements IPositionItem {
  private _PLFormatter = new PriceFormatter(2);
  private _priceFormatter = new PriceFormatter(this.position.instrument?.precision ?? 2);

  account = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  instrumentName = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  exchange = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  price = new NumberCell({ withHoverStatus: true, getStatusByStyleProp, formatter: this._priceFormatter });
  size = new NumberCell({ withHoverStatus: true, getStatusByStyleProp, ignoreZero: false });
  unrealized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true,
    ignoreZero: false,
    formatter: this._PLFormatter,
    getStatusByStyleProp
  });
  realized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true,
    ignoreZero: false,
    formatter: this._PLFormatter,
    getStatusByStyleProp
  });
  total = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    withHoverStatus: true,
    formatter: this._PLFormatter,
    ignoreZero: false,
    getStatusByStyleProp,
  });
  close = new IconCell({ withHoverStatus: true, getStatusByStyleProp, size: 10 });
  side = new DataCell({ withHoverStatus: true, getStatusByStyleProp });

  get id(): Id | undefined {
    return this.position && this.position.id;
  }

  constructor(public position?: IPosition) {
    super();
    if (!position) {
      return;
    }
    this.update(position);
  }

  update(position: IPosition) {
    this.position = { ...this.position, ...position };
    this._priceFormatter.updateDigits(this.position.instrument?.precision ?? 2);
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
    cell.changeStatus(getProfitStatus(cell));
  }

  protected _getCellsToHover(): Cell[] {
    return allColumns.map((field) => this[field]);
  }
}

const getStatusByStyleProp: CellStatusGetter = (cell, style) => {
  if (cell.hovered && cell.hoverStatusEnabled && style === 'BackgroundColor') {
    return ([ProfitStatus.InProfit, ProfitStatus.Loss] as string[]).includes(cell.status)
      ? cell.status : CellStatus.Hovered;
  }

  return cell.status;
}
