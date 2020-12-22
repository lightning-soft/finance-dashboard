import { AddClassStrategy, NumberCell } from 'data-grid';
export const histogramComponent = 'histogram-component';

interface IHistogramSettings {
  backgroundColor: string;
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
    // console.log(this.settings);
    this.hist = value / total * 100;
  }
}
