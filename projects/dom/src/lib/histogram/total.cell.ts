import { HistogramCell } from './histogram.cell';

export class TotalCell extends HistogramCell {
  updateValue(value: number, time?: number) {
    return super.updateValue((this._value ?? 0) + (value ?? 0), time);
  }

  protected _updateValue(value: number) {
    return super.updateValue(value ?? 0);
  }

  hightlight() {
    if (this.settings.highlightLarge && this._value < (this.settings.largeSize || 0)) {
      return;
    }

    super.hightlight();
  }

  clear() {
    this.hist = 0;
    this._histValue = 0;
    super.clear();
  }
}
