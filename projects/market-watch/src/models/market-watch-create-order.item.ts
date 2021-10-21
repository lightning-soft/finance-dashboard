import { IInstrument, IOrder, OrderDuration, OrderSide, OrderType } from 'trading';
import { MarketWatchSubItem } from './market-watch.sub-item';
import { ItemType } from './interface-market-watch.item';

export interface OrderSettings {
  side: OrderSide;
  duration: OrderDuration;
  type: OrderType;
}

export const defaultQuantity = 1;

export const createOrderPrefix = 'createOrder';


export class MarketWatchCreateOrderItem extends MarketWatchSubItem {
  itemType = ItemType.CreateItem;
  limitPrice = this.price;
  stopPrice = this.triggerPrice;


  constructor(public instrument: IInstrument, orderSettings: OrderSettings) {
    super();
    this.id = createOrderPrefix + instrument.id;
    this.side.updateValue(orderSettings.side);
    this.side.editable = true;
    this.side.editType = 'orderSide';
    this.side.editValueSetter = (target) => {
      this.side.updateValue(target.instance.value);
    };

    this.type.updateValue(orderSettings.type);
    this.updatePrices(orderSettings.type);
    this.type.editable = true;
    this.type.editType = 'orderType';
    this.type.editValueSetter = (target) => {
      this.updatePrices(target.instance.value);
      this.type.updateValue(target.instance.value);
    };

    this.actions.setState({ play: true, close: true, stop: false });

    this.duration.updateValue(orderSettings.duration);
    this.duration.editable = true;
    this.duration.editType = 'orderDuration';
    this.duration.editValueSetter = (target) => {
      this.duration.updateValue(target.instance.value);
    };

    this.quantity.editable = true;
    this.quantity.updateValue(defaultQuantity);
    this.quantity.editType = 'quantity';
    this.quantity.editValueSetter = (target) => {
      this.quantity.updateValue(target.instance.value);
    };

    this.price.editType = 'limitPrice';
    this.price.editValueSetter = (target) => {
      this.price.updateValue(target.instance.value);
    };

    this.triggerPrice.editType = 'stopPrice';
    this.triggerPrice.editValueSetter = (target) => {
      this.triggerPrice.updateValue(target.instance.value);
    };

    this.accountId.editType = 'accounts';
    this.accountId.editable = true;
    this.accountId.editValueSetter = (target) => {
      this.accountId.updateValue(target.instance.account.id);
    };
  }

  private updatePrices(type) {
    const limitEnabled = [OrderType.Limit, OrderType.StopLimit].includes(type);
    this.limitPrice.editable = limitEnabled;
    this.limitPrice.changeStatus(limitEnabled ? this.priceEnabledStatus : this.priceDisabledStatus);

    const stopPriceEnabled = [OrderType.StopMarket, OrderType.StopLimit].includes(type);
    this.stopPrice.editable = stopPriceEnabled;
    this.stopPrice.changeStatus(stopPriceEnabled ? this.priceEnabledStatus : this.priceDisabledStatus);
  }

  protected getPrefix() {
    return createOrderPrefix;
  }

  public updateOrder(order: IOrder) {
  }

  getDto(): IOrder {
    return {
      type: this.type.value as OrderType,
      side: this.side.value as OrderSide,
      duration: this.duration.value as OrderDuration,
      quantity: this.quantity._value,
      symbol: this.instrument.symbol,
      exchange: this.instrument.exchange,
      limitPrice: this.price._value,
      stopPrice: this.triggerPrice._value,
      accountId: this.accountId.value,
    } as IOrder;
  }

  applySettings(settings) {
    super.applySettings(settings);
  }
}
