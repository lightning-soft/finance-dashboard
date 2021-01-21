import * as merge from 'deepmerge';
import { TextAlign } from 'dynamic-form';
import { HistogramOrientation } from './settings-fields';

export class DomSettings {

  general: any = {};
  hotkeys: any = {};
  columns: any = {};
  common: any = {};
  ltq: any = {
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
  };
  orderArea = {
    buyButtonsBackgroundColor: '#2A8AD2',
    flatButtonsBackgroundColor: '#383A40',
    buyButtonsFontColor: '#F2F2F2',
    flatButtonFontColor: '#fff',
    sellButtonsBackgroundColor: '#DC322F',
    cancelButtonBackgroundColor: '#51535A',
    sellButtonsFontColor: '#F2F2F2',
    cancelButtonFontColor: '#fff',
    formSettings: {
      showInstrumentChange: true,
      closePositionButton: true,
      showOHLVInfo: true,
      showFlattenButton: true,
      showPLInfo: true,
      showIcebergButton: true,
      roundPL: false,
      includeRealizedPL: false
    },
  };
  price: any = {
    backgroundColor: 'rgba(16, 17, 20, 1)',
    fontColor: 'rgba(208, 208, 210, 1)',
    highlightBackgroundColor: null,
    lastTradedPriceFontColor: null,
    nonTradedPriceBackColor: null,
    nonTradedPriceFontColor: null,
    textAlign: TextAlign.Center,
    tradedPriceBackColor: null
  };
  bidDelta: any = {
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
  };
  askDelta: any = {
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Center,
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
  };
  bid: any = {
    fontColor: 'white',
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left
  };
  ask: any = {
    fontColor: 'white',
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    histogramColor: 'rgba(201, 59, 59, 0.2)',
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left
  };
  bidDepth: any = {
    backgroundColor: 'rgba(201, 59, 59, 0.3)',
    histogramColor: 'rgba(201, 59, 59, 0.2)',
    highlightBackgroundColor: 'rgba(201, 59, 59, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left
  };
  askDepth: any = {
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left
  };
  totalAsk: any = {
    histogramColor: 'rgba(72, 149, 245, 0.3)',
    textAlign: TextAlign.Right,
    fontColor: 'rgba(72, 149, 245, 1)'
  };
  totalBid: any = {
    histogramColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Right,
    fontColor: 'rgba(235, 90, 90, 1)',
  };
  volumeProfile: any = {
    highlightBackgroundColor: 'rgba(73, 187, 169, 0.3)',
    histogramOrientation: HistogramOrientation.Right
  };
  order: any = {};
  currentBid: any = {
    fontColor: '#EB5A5A',
    histogramColor: 'rgba(201, 59, 59, 0.4)',
  };
  note: any = {};
  currentAsk: any = {
    fontColor: '#4895F5',
    histogramColor: 'rgba(72, 149, 245, 0.4)',
  };

  static fromJson(json: any): DomSettings {
    const settings = new DomSettings();
    settings.merge(json);
    return settings;
  }

  merge(data: Partial<DomSettings>) {
    for (const key in data) {
      if (!this.hasOwnProperty(key)) {
        console.warn(`Check property ${key} in settings`);
        continue;
      }

      Object.assign(this[key], data[key]);
    }
  }

  toJson() {
    return merge({}, this);
  }
}
