import { AddClassStrategy, ICellSettings, NumberCell } from 'data-grid';
import { HistogramOrientation } from '../dom-settings/settings-fields';

export const histogramComponent = 'histogram-component';

export interface IHistogramSettings extends ICellSettings {
  histogramOrientation: HistogramOrientation;
  highlightBackgroundColor: string;
  histogramColor: string;
  enableHistogram: boolean;
  highlightLarge?: boolean;
  largeSize?: number;
}

export class HistogramCell extends NumberCell {
  hist = 0;
  settings: IHistogramSettings;

  private _histValue;

  constructor(config) {
    super({
      strategy: AddClassStrategy.NONE,
      component: 'histogram',
    });
    this.settings = config.settings;
  }

  updateValue(value: number) {
    const r = super.updateValue(value);
    if (this._histValue != null)
      this.calcHist(this._histValue);

    return r;
  }

  calcHist(value: number) {
    this.hist = this._value / value;
    this._histValue = value;
  }
}
