import { Id } from 'base-components';
import {
  AddClassStrategy,
  Cell, CellStatus, CellStatusGetter,
  DataCell,
  HoverableItem,
  IconCell,
  IFormatter,
  NumberCell,
  ProfitClass,
  RoundFormatter
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
  private _priceFormatter: IFormatter;

  account = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  instrumentName = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  exchange = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  price = new NumberCell({ withHoverStatus: true, getStatusByStyleProp });
  size = new NumberCell({ withHoverStatus: true, getStatusByStyleProp, ignoreZero: false });
  unrealized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true,
    ignoreZero: false,
    getStatusByStyleProp
  });
  realized = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    hightlightOnChange: false,
    withHoverStatus: true,
    ignoreZero: false,
    getStatusByStyleProp
  });
  total = new NumberCell({ withHoverStatus: true, getStatusByStyleProp });
  close = new IconCell({ withHoverStatus: true, getStatusByStyleProp });
  side = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
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
    this.price.updateValue(this.position.price);

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

  public updateUnrealized(trade: TradePrint, instrument: IInstrument) {
    const position = this.position;

    if (position == null || !compareInstruments(trade.instrument, position.instrument))
      return;

    const unrealized = calculatePL(position, trade.price, instrument.tickSize, instrument.contractSize);
    this.unrealized.updateValue(unrealized ?? 0);

    this._updateCellProfitStatus(this.unrealized);
  }

  private _updateCellProfitStatus(cell: Cell): void {
    let status = PositionStatus.None;

    if (cell.class === ProfitClass.DOWN)
      status = PositionStatus.Loss;
    else if (cell.class === ProfitClass.UP)
      status = PositionStatus.InProfit;
    cell.changeStatus(status);
  }

  protected _getCellsToHover(): Cell[] {
    return allColumns.map((field) => this[field]);
  }
}

const getStatusByStyleProp: CellStatusGetter = (cell, style) => {
  if (cell.hovered && cell.hoverStatusEnabled && style === 'BackgroundColor') {
    return ([PositionStatus.InProfit, PositionStatus.Loss] as string[]).includes(cell.status)
      ? cell.status : CellStatus.Hovered;
  }

  return cell.status;
}
