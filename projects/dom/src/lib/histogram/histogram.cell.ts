import { AddClassStrategy, ICellSettings, INumberConfig, NumberCell } from 'data-grid';
import { HistogramOrientation } from 'dynamic-form';

export const histogramComponent = 'histogram-component';

interface IHistogramConfig extends INumberConfig {
  settings: IHistogramSettings;
}

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

  protected _histValue;

  constructor(config: IHistogramConfig) {
    super({
      ...config,
      strategy: AddClassStrategy.NONE,
      component: 'histogram',
    });
    this.settings = config.settings;
  }

  updateValue(value: number, time?: number) {
    const r = super.updateValue(value, time);
    if (this._histValue != null)
      this.calcHist(this._histValue);

    return r;
  }

  calcHist(value: number) {
    if (this._value == null)
      this.hist = 0;
    else
      this.hist = this.visible ? this._value / value : 0;
    // if (this.hist > 1)
    //   console.log('Invalid hist', this);
    this._histValue = value;
  }

  _visibilityChange() {
    super._visibilityChange();
    this.calcHist(this._histValue);
  }

  clear() {
    super.clear();
    if (this._histValue != null)
      this.calcHist(this._histValue);
  }

  reset(value) {
    this._setValue(value);
    if (this._histValue != null)
      this.calcHist(this._histValue);
  }
}
