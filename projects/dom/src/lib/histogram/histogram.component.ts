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
      z-index: 2;
      display: inline-block;
      width: 100%;
      position: relative;
    }

    .histogram-container {
      width: 100%;
      height: 100%;
      transition: all 0.3s;
      display: inline-block;

    }
    .histogram {
      position: absolute;
      left: 0;
      height: 100%;
      background: #804444a1;
    }

    .histogram.right {
      right: 0;
      left: unset;
    }
  `]
})
export class HistogramComponent {
  @Input() cell: HistogramCell;
}
