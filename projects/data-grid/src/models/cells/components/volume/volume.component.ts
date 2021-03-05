import { Component, Input } from '@angular/core';

export const volumeComponentSelector = 'volume-component';

@Component({
  selector: volumeComponentSelector,
  templateUrl: './volume-component.html',
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
export class VolumeComponent {
  @Input() cell: any;
}
