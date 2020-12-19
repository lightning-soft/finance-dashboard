import { ITrade } from "trading";

export class TotalAccomulator {
  volume = 0;
  ask = 0;
  bid = 0;

  handleTrade(trade: ITrade) {
    this.volume += trade.volume;
    this.ask += trade.askInfo.volume;
    this.bid += trade.bidInfo.volume;
  }
}

// export class RowAccomulator {
//   volume: 0;
//   ask: 0;
//   bid: 0;

//   handleTrade(trade: ITrade) {
//     this.volume += trade.volume;
//     this.ask += trade.askInfo.volume;
//     this.bid += trade.bidInfo.volume;
//   }
// }
