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

    .histogram {
      position: absolute;
      height: 100%;
      background: #804444a1;
    }
  `]
})
export class HistogramComponent {
  @Input() cell: HistogramCell;
}
