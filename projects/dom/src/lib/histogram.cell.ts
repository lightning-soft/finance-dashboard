import { AddClassStrategy, NumberCell, volumeComponentSelector } from 'data-grid';

export class HistogramCell extends NumberCell {
  hist = 0;

  constructor() {
    super({
      strategy: AddClassStrategy.NONE,
      component: volumeComponentSelector,
    });
  }

  update(value: number, total: number) {
    super.updateValue(value);
    this.hist = value / total * 100;
  }
}
