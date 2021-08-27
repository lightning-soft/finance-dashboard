export class ConnectionMessageAggregate {
  History = null;
  PnL = null;
  message = '';
  TradingSystem = null;
  MarketData = null;
  clear = () => {
    this.History = null;
    this.PnL = null;
    this.TradingSystem = null;
    this.MarketData = null;
    this.message = '';
  }
  isFull = () => {
    return this.History && this.PnL && this.TradingSystem && this.MarketData;
  }
}
