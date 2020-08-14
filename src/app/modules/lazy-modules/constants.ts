import {IModules} from './models';

export const Modules = {
  Chart: 'chart',
  Watchlist: 'watchlist',
  Position: 'position'

};

export const Components = {
  Chart: 'chart',
  Watchlist: 'watchlist',
  Position: 'position'
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
  {
    module: Modules.Position,
    components: [
      Components.Position,
    ]
  },
];
