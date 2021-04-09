import { OrderItem } from 'base-order-form';
import { Icon, IconCell } from 'data-grid';

export class CustomOrderItem extends OrderItem {
  moveDown = new IconCell(Icon.MoveDown);
  moveUp = new IconCell(Icon.MoveUp);
  stop = new IconCell(Icon.Stop);
  play = new IconCell(Icon.Play);
  close = new IconCell();

  changeStatus() {
    this.side.changeStatus(this.side.value.toLowerCase());
  }
}
