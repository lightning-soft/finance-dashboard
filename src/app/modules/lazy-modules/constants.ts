import { IModules } from './models';

export const Modules = {
    Chart: 'chart',
    Watchlist: 'watchlist',
};

export const Components = {
    Chart: 'chart',
    Watchlist: 'watchlist',
};

export const modulesStore: IModules[] = [
    {
        module: Modules.Chart,
        components: [
            Components.Chart,
        ]
    },
    {
        module: Modules.Watchlist,
        components: [
            Components.Watchlist,
        ]
    },
];
