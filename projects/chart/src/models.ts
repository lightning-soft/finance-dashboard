import { IScxComponentState } from 'chart';
import { IBaseTemplate } from 'templates';
import { IAccount } from 'trading';
import { IChartSettings } from "./chart-settings/settings";

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
  componentInstanceId: number;
  settings: IChartSettings;
}
export type IChartTemplate = IBaseTemplate<IChartState>;
