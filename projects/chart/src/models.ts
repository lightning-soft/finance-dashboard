import { IScxComponentState } from "chart";
import { IBaseTemplate } from "templates";
import { SideOrderForm } from "base-order-form";

export * from './models/index';
export * from './datafeed/index';

export interface IChartState extends IScxComponentState {
  showOHLV: boolean;
  showChanges: boolean;
  showChartForm: boolean;
  enableOrderForm: boolean;
  link: any;
  showOrderConfirm: boolean;
  orderForm: Partial<SideOrderForm>;
}
export type IChartTemplate = IBaseTemplate<IChartState>;
