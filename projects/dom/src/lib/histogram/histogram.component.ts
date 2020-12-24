import { Component, Input } from '@angular/core';
import { HistogramCell, histogramComponent } from './histogram.cell';

@Component({
  selector: histogramComponent,
  templateUrl: './histogram.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .data {
      position: relative;
      width: 100%;
      display: inline-block;
    }

    .histogram {
      position: absolute;
      left: 0;
      height: 100%;
      background: #804444a1;
    }
  `]
})
export class HistogramComponent {
  @Input() cell: HistogramCell;
}
