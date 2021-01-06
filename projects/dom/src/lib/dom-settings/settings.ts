import { TextAlign } from 'dynamic-form';
import { getDefaultSettings, HistogramOrientation } from './settings-fields';

export class DomSettings {
  general: any = {};
  hotkeys: any = {};
  columns: any = {};
  common: any = {};
  ltq: any = {};
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

  merge(data: Partial<DomSettings>) {
    for (const key in data) {
      if (!this.hasOwnProperty(key)) {
        console.warn(`Check property ${key} in settings`)
        continue;
      }

      Object.assign(this[key], data[key])
    }
  }
}
