import { IViewItem, StringHelper } from 'base-components';
import { Id } from 'communication';
import { DataCell, IconCell, CheckboxCell, Column } from 'data-grid';
import { DataCell, IconCell, CheckboxCell, Cell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';

const allFields: Partial<keyof OrderItem>[] = [
  'checkbox',
  'averageFillPrice',
  'description',
  'duration',
  'filledQuantity',
  'quantity',
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

export type HeaderItem = [string, string, IHeaderItemOptions?] | string;

export interface IHeaderItemOptions {
  style?: any;
  width?: number;
  drawObject?: { draw(context): boolean }
}

export class OrderItem implements IViewItem<IOrder> {
  exchange = new DataCell();
  symbol = new DataCell();
  fcmId = new DataCell();
  identifier = new DataCell();
  ibId = new DataCell();
  averageFillPrice = new DataCell();
  description = new DataCell();
  duration = new DataCell();
  filledQuantity = new DataCell();
  quantity = new DataCell();
  side = new DataCell();
  status = new DataCell();
  type = new DataCell();
  close = new IconCell();
  checkbox = new CheckboxCell();
  order: IOrder;

  get id(): Id {
    return this.order.id;
  }

  get isSelected(): boolean {
    return this.checkbox.checked;
  }

  constructor(order: IOrder) {
    this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };
    ['averageFillPrice', 'description', 'duration', 'filledQuantity', 'quantity', 'side', 'status', 'type']
      .forEach((item) => {
        this[item].updateValue(order[item]);
      });

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
    ['averageFillPrice', 'description', 'duration', 'filledQuantity', 'quantity', 'side', 'status', 'type', 'exchange', 'symbol', 'fcmId', 'ibId', 'identifier']
      .forEach((item) => {
        this[item].changeStatus(this['side'].value.toLowerCase());
      });
  }

  toggleSelect(event: MouseEvent): void {
    this.checkbox.toggleSelect(event);
    this._updateSelectedStatus();
  }

  updateSelect(selected: boolean): void {
    this.checkbox.updateValue(selected);
    this._updateSelectedStatus();
  }

  private _updateSelectedStatus(): void {
    const selectedStatusName = this.isSelected ? 'selected' : '';
    allFields.forEach(field => (this[field] as Cell).setStatusPrefix(selectedStatusName));
  }

  changeCheckboxHorizontalAlign(align: 'left' | 'right' | 'center'): void {
    this.checkbox.horizontalAlign = align;
  }
}


export function transformHeaderColumn(nameOrArr: HeaderItem) {
  nameOrArr = Array.isArray(nameOrArr) ? nameOrArr : ([nameOrArr, nameOrArr, {}]);
  const [name, title, options] = nameOrArr;

  const column: Column = {
    name,
    title: title.toUpperCase(),
    tableViewName: StringHelper.capitalize(name),
    style: {
      ...options?.style,
      buyColor: 'rgba(72, 149, 245, 1)',
      sellColor: 'rgba(220, 50, 47, 1)',
      textOverflow: true,
      textAlign: 'left',
    },
    visible: true,
    width: options?.width
  };

  if (options?.drawObject) {
    column.draw = (context) => options.drawObject.draw(context)
  }

  return column;
}
