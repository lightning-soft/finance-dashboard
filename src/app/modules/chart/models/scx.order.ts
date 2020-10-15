// import {Order} from '../../Orders/models/order';
import {IScxOrder, ScxOrderAction, ScxOrderKind, ScxOrderState, ScxOrderTimeInForce} from './chart';
import {IOrder, OrderAction, OrderKind, OrderState} from 'communication';
import {TimeInForce} from '../../Communication/model/time-inforce';

const ActionMap = {};

ActionMap[OrderAction.Sell] = ScxOrderAction.SELL;
ActionMap[OrderAction.Buy] = ScxOrderAction.BUY;

const OrderKindMap = {};

OrderKindMap[OrderKind.Market] = ScxOrderKind.MARKET;
OrderKindMap[OrderKind.StopLimit] = ScxOrderKind.STOP_LIMIT;
OrderKindMap[OrderKind.Stop] = ScxOrderKind.STOP;
OrderKindMap[OrderKind.Limit] = ScxOrderKind.LIMIT;
OrderKindMap[OrderKind.StopLimit] = ScxOrderKind.STOP_LIMIT;

const OrderStateMap = {};

OrderStateMap[OrderState.Accepted] = ScxOrderState.ACCEPTED;
OrderStateMap[OrderState.PendingCancel] = ScxOrderState.PENDING_CANCEL;
OrderStateMap[OrderState.PendingReplace] = ScxOrderState.PENDING_REPLACE;
OrderStateMap[OrderState.PendingSubmit] = ScxOrderState.PENDING_SUBMIT;
OrderStateMap[OrderState.Submitted] = ScxOrderState.SUBMITTED;

const TimeInForceMap = {};

TimeInForceMap[TimeInForce.Day] = ScxOrderTimeInForce.DAY;
TimeInForceMap[TimeInForce.Gtd] = ScxOrderTimeInForce.GOOD_TILL_DATE;
TimeInForceMap[TimeInForce.Gtc] = ScxOrderTimeInForce.GOOD_TILL_CANCEL;

export class ScxOrder {
  static convert(order: IOrder) {
    let price;

    if (order.kind === OrderKind.Limit)
      price = order.limitPrice;
    else if (order.kind === OrderKind.Stop)
      price = order.stopPrice;

    return {
      id: order.id,
      price,
      stopPrice: order.stopPrice,
      action: ActionMap[order.action],
      kind: OrderKindMap[order.kind],
      quantity: order.lots,
      state: OrderStateMap[order.state],
      timeInForce: TimeInForceMap[order.timeInForce],
      date: new Date(order.timestamp)
    };
  }
}
