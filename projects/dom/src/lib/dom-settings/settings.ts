import { getDefaultSettings } from "./settings-fields";

export class DomSettings {
  general: any = {};
  hotkeys: any = {};
  columns: any = {};
  common: any = {};
  ltg: any = {};
  price: any = {};
  bidDelta: any = {};
  askDelta: any = {};
  bid: any = { backgroundColor: 'red' };
  ask: any = { backgroundColor: 'red' };
  bidDepth: any = {};
  askDepth: any = {};
  totalAsk: any = {};
  totalBid: any = {};
  volumeProfile: any = {};
  order: any = {};
  currentAtBid: any = {};
  note: any = {};
  currentAtAsk: any = {};
  _ask;
  constructor() {
    (window as any).t = (this);
    this._ask = this.ask;
    // this.merge(getDefaultSettings());
  }

  merge(data: Partial<DomSettings>) {
    for (const key in data) {
      Object.assign(this[key], data[key])
    }
  }
}
