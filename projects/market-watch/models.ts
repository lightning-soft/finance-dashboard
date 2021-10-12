import { Id } from 'communication';
import { IBaseTemplate } from 'templates';
import { MarketWatchSettings } from './src/market-watch-settings/market-watch-settings.component';
import { Tab } from './src/tab.model';

export interface IMarketWatchState {
    tabs: Tab[];
    currentTabId: Id;
    contextMenuState: any;
    componentInstanceId: number;
    settings: MarketWatchSettings;
    accountId: Id;
    createdOrders: Id[];
}

export type IMarketWatchPresets = IBaseTemplate<IMarketWatchState>;
