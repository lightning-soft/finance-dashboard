import { NumberCell } from 'data-grid';

export class PriceCell extends NumberCell {
  isTraded = false;

  dehightlight() {
    super.dehightlight();

    if (this.status != 'tradedPrice' && this.isTraded) {
      this.changeStatus('tradedPrice');
    } else if (this.status == 'tradedPrice' && !this.isTraded) {
      this.changeStatus('');
    }
  }
}
