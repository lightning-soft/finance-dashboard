export enum MarketWatchColumns {
  Symbol = 'symbol',
  Position = 'pos',
  Last = 'last',
  NetChange = 'netChange',
  PercentChange = 'percentChange',
  WorkingBuys = 'workingBuys',
  BidQuantity = 'bidQuantity',
  Bid = 'bid',
  Ask = 'ask',
  AskQuantity = 'askQuantity',
  WorkingSells = 'workingSells',
  Volume = 'volume',
  Settle = 'settle',
  High = 'high',
  Low = 'low',
  Open = 'open',
}

export const MarketWatchColumnsArray = Object.values(MarketWatchColumns);
Object.freeze(MarketWatchColumnsArray);
