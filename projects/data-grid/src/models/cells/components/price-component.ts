import { Component, Input } from '@angular/core';
import { NumberCell } from '../number.cell';

export const priceComponentSelector = 'price-component';

@Component({
  selector: priceComponentSelector,
  templateUrl: './price-component.html',
  styles: [`
    .icon {
      font-size: 0.8em;
      margin-right: 8px;
    }
  `]
})
export class PriceComponent {
  @Input() cell: NumberCell;
}
