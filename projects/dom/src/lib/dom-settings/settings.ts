import { Column } from 'data-grid';
import * as merge from 'deepmerge';
import { TextAlign } from 'dynamic-form';
import { HistogramOrientation } from './settings-fields';

export class DomSettings {
  static fromJson(json: any): DomSettings {
    const settings = new DomSettings();
    settings.merge(json);
    return settings;
  }

  private _columns: Column[] = [];
  public get columns(): Column[] {
    return this._columns;
  }
  public set columns(value: Column[]) {
    this._columns = value;
    this._setDataToColumns();
  }

  general: any = {};
  hotkeys: any = {};
  // columns: any = {};
  common: any = {};
  ltq: any = {
    highlightBackgroundColor: 'rgba(56, 58, 64, 1)',
  };
  price: any = {
    backgroundColor: 'rgba(16, 17, 20, 1)',
    color: 'rgba(208, 208, 210, 1)',
    highlightBackgroundColor: null,
    lastTradedPriceColor: null,
    nonTradedPriceBackColor: null,
    nonTradedPriceColor: null,
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
    color: 'white',
    backgroundColor: 'rgba(72, 149, 245, 0.2)',
    highlightBackgroundColor: 'rgba(72, 149, 245, 1)',
    textAlign: TextAlign.Center,
    histogramOrientation: HistogramOrientation.Left
  };
  ask: any = {
    color: 'white',
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
    color: 'rgba(72, 149, 245, 1)'
  };
  totalBid: any = {
    histogramColor: 'rgba(201, 59, 59, 0.3)',
    textAlign: TextAlign.Right,
    color: 'rgba(235, 90, 90, 1)',
  };
  volume: any = {
    highlightBackgroundColor: 'rgba(73, 187, 169, 0.3)',
    histogramOrientation: HistogramOrientation.Right
  };
  order: any = {};
  currentBid: any = {
    color: '#EB5A5A',
    histogramColor: 'rgba(201, 59, 59, 0.4)',
  };
  note: any = {};
  currentAsk: any = {
    color: '#4895F5',
    histogramColor: 'rgba(72, 149, 245, 0.4)',
  };

  merge(data: Partial<DomSettings>) {
    for (const key in data) {
      if (!this.hasOwnProperty(key) || key == '_columns' || key == 'columns') {
        console.warn(`Check property ${key} in settings`);
        continue;
      }

      const column = this.columns.find(i => i.name == key);
      // console.log('before', (window as any).grid?.schema[0] == this.columns[0])
      if (column) {
        if (!column.style)
          column.style = {};

        // if (key != '_columns' && key != 'columns')
        Object.assign(column.style, data[key]);
        // console.log((window as any).grid?.scheme[0] == this.columns[0])
      } else {
        console.warn(`Missing column ${key}`)
      }
    }

    console.log(data);
  }

  private _setDataToColumns() {
    this.merge(this);
  }

  toJson() {
    return merge({}, this as any);
  }
}
