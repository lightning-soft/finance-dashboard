import { AddClassStrategy, ICellSettings, NumberCell } from 'data-grid';
import { HistogramOrientation } from '../dom-settings/settings-fields';

export const histogramComponent = 'histogram-component';

export interface IHistogramSettings extends ICellSettings {
  histogramOrientation: HistogramOrientation;
  highlightBackgroundColor: string;
  histogramColor: string;
  enableHistogram: boolean;
}

export class HistogramCell extends NumberCell {
  hist = 0;
  settings: IHistogramSettings;

  constructor(config) {
    super({
      strategy: AddClassStrategy.NONE,
      component: histogramComponent,
    });
    this.settings = config.settings;
  }

  update(value: number, total: number, time: number) {
    super.updateValue(value, time);
    this.hist = value / total;
  }
}
