import { AddClassStrategy, NumberCell } from 'data-grid';
import { TextAlign } from 'dynamic-form';
import { HistogramOrientation } from '../dom-settings/settings-fields';

export const histogramComponent = 'histogram-component';

interface IHistogramSettings {
  backgroundColor: string;
  fontColor: string;
  textAlign: TextAlign;
  orientation: HistogramOrientation;
  highlightBackgroundColor: string;
  histogramColor: string;
  fontSize: number;
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

  update(value: number, total: number) {
    super.updateValue(value);
    this.hist = value / total;
  }
}
