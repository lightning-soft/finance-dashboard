import { priceComponentSelector } from './components/price-component';
import { NumberCell } from './number.cell';
export class PriceCell extends NumberCell {
  component = priceComponentSelector;

  constructor(public iconClass) {
    super();
    this.class = iconClass;
  }

}
