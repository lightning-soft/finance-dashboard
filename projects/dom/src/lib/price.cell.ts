import { NumberCell } from 'data-grid';

export class PriceCell extends NumberCell {
  isTraded = false;

  clear() {
    this.revertStatus();
  }

  revertStatus() {
    super.revertStatus();
    if (!this.status && this.isTraded) {
      this.status = 'tradedPrice';
    }
  }
}
