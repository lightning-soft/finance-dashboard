import { OrderItem } from 'base-order-form';
import { Icon, IconCell } from 'data-grid';

export class CustomOrderItem extends OrderItem {
  moveDown = new IconCell({icon: Icon.MoveDown});
  moveUp = new IconCell({icon: Icon.MoveUp});
  stop = new IconCell({icon: Icon.Stop});
  play = new IconCell({icon: Icon.Play});
  close = new IconCell();

  changeStatus() {
    this.side.changeStatus(this.side.value.toLowerCase());
  }
}
