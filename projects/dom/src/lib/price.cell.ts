import { NumberCell } from 'data-grid';

export class PriceCell extends NumberCell {
  isTraded = false;

  dehightlight() {
    super.dehightlight();

    if (!this.status && this.isTraded) {
      this.status = 'tradedPrice';
    }
  }
}
