import { IScxComponentState } from 'chart';
import { IBaseTemplate } from 'templates';
import { SideOrderFormState } from 'base-order-form';
import { IAccount } from 'trading';

export * from './models/index';
export * from './datafeed/index';

export interface IChartState extends IScxComponentState {
  showOHLV: boolean;
  showChanges: boolean;
  showChartForm: boolean;
  enableOrderForm: boolean;
  link: any;
  showOrderConfirm: boolean;
  account?: IAccount;
  orderForm: SideOrderFormState
  ;
}
export type IChartTemplate = IBaseTemplate<IChartState>;
