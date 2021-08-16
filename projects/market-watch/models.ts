import { Id } from 'communication';
import { Column } from 'data-grid';
import { IBaseTemplate } from 'templates';
import { MarketWatchSettings } from './src/market-watch-settings/market-watch-settings.component';
import { Tab } from './src/tab.model';

export interface IMarketWatchState {
    columns: Column[];
    tabs: Tab[];
    currentTabId: Id;
    contextMenuState: any;
    componentInstanceId: number;
    settings: MarketWatchSettings;
    accountId: Id;
    createdOrders: Id[];
}
  
export type IMarketWatchPresets = IBaseTemplate<IMarketWatchState>;