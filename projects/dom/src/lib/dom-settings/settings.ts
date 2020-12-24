import { TextAlign } from 'dynamic-form';
import { HistogramOrientation } from './settings-fields';

export class DomSettings {
  general: any = {};
  hotkeys: any = {};
  columns: any = {};
  common: any = {};
  ltg: any = {};
  price: any = {fontColor: 'white', textAlign: TextAlign.Center};
  bidDelta: any = {};
  askDelta: any = {};
  bid: any = {fontColor: 'white', textAlign: TextAlign.Center, orientation: HistogramOrientation.Left};
  ask: any = {fontColor: 'white', textAlign: TextAlign.Center, orientation: HistogramOrientation.Left};
  bidDepth: any = {};
  askDepth: any = {};
  totalAsk: any = {};
  totalBid: any = {};
  volumeProfile: any = {fontColor: 'white', textAlign: TextAlign.Center, orientation: HistogramOrientation.Left};
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
