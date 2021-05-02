import { IViewItem } from 'base-components';
import { Id } from 'communication';
import { Cell, CellStatus, CellStatusGetter, CheckboxCell, DataCell, IconCell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';
import { TextAlign } from 'dynamic-form';
import { HoverableItem } from "../../../../base-components/src/components/hoverable.item";

const allFields: Partial<keyof OrderItem>[] = [
  'checkbox',
  'accountId',
  'averageFillPrice',
  'description',
  'duration',
  'filledQuantity',
  'quantity',
  'quantityRemain',
  'side',
  'status',
  'type',
  'exchange',
  'symbol',
  'fcmId',
  'ibId',
  'identifier',
  'close',
];

export class OrderItem extends HoverableItem implements IViewItem<IOrder> {
  accountId = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  exchange = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  symbol = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  fcmId = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  identifier = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  ibId = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  averageFillPrice = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  description = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  duration = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  filledQuantity = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  quantityRemain = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  quantity = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  side = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  status = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  type = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  close = new IconCell({ withHoverStatus: true, getStatusByStyleProp });
  checkbox = new CheckboxCell({ withHoverStatus: true, getStatusByStyleProp });
  order: IOrder;

  get id(): Id {
    return this.order.id;
  }

  get isSelected(): boolean {
    return this.checkbox.checked;
  }

  constructor(order: IOrder) {
    super();
    this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };

    ['averageFillPrice', 'description', 'duration', 'filledQuantity', 'quantity', 'side', 'status', 'type']
      .forEach((item) => {
        this[item]?.updateValue(order[item]);
      });

    this.accountId.updateValue(order.account.id);
    this.quantityRemain.updateValue(order.quantity - order.filledQuantity);

    ['exchange', 'symbol']
      .forEach((item) => {
        this[item].updateValue(order.instrument[item]);
      });

    ['fcmId', 'ibId']
      .forEach((item) => {
        this[item].updateValue(order.account[item]);
      });

    this.changeStatus();
    this.identifier.updateValue(order.id);

    this.side.class = order.side === OrderSide.Buy ? PriceStatus.Up : PriceStatus.Down;
  }

  changeStatus() {
    ['averageFillPrice', 'description', 'quantityRemain', 'duration', 'accountId', 'filledQuantity', 'quantity', 'side', 'status', 'type', 'exchange', 'symbol', 'fcmId', 'ibId', 'identifier']
      .forEach((item) => {
        this[item]?.changeStatus(this.side.value.toLowerCase());
      });
  }

  toggleSelect(event: MouseEvent): void {
    this.checkbox.toggleSelect(event);
    this._updateSelectedStatus();
  }

  updateSelect(selected: boolean): void {
    this.checkbox.updateValue(selected);
    this._updateSelectedStatus();
    console.log(this);
  }

  private _updateSelectedStatus(): void {
    const selectedStatusName = this.isSelected ? CellStatus.Selected : CellStatus.None;
    allFields.forEach(field => (this[field] as Cell).setStatusPrefix(selectedStatusName));
  }

  changeCheckboxHorizontalAlign(align: TextAlign): void {
    this.checkbox.horizontalAlign = align;
  }

  protected _getCellsToHover(): Cell[] {
    return allFields.map((field) => this[field] as Cell);
  }
}

const getStatusByStyleProp: CellStatusGetter = (cell, style) => {
  if (cell.hovered && cell.hoverStatusEnabled && style === 'BackgroundColor') {
    return CellStatus.Hovered;
  }

  return cell.status;
}
