import { Component } from '@angular/core';

// const createItem = (value, status = DataStatus.NONE): IDataItem => {
//   return { value, status } as IDataItem;
// };

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {


  headers = ['Symbol', 'Side', 'Size', 'Executed', 'price', 'Price in', 'status', 'type'];

  data = [
    // [createItem('BTCUSD'), createItem('Buy', DataStatus.DOWN),
    // createItem('0.000507551'), createItem('0.000507551'), createItem('1.10538'), createItem('1.10538'), createItem('Open'), createItem('Market')],
    // [createItem('BTCUSD'), createItem('Sell', DataStatus.UP), createItem('0.000507551'),
    // createItem('0.000507551'), createItem('1.10538'), createItem('1.10538'), createItem('Open'), createItem('Market')],
    // [createItem('BTCUSD'), createItem('Buy', DataStatus.DOWN), createItem('0.000507551'),
    // createItem('0.000507551'), createItem('1.10538'), createItem('1.10538'), createItem('Open'), createItem('Market')],
    // [createItem('BTCUSD'), createItem('Sell', DataStatus.UP), createItem('0.000507551'),
    // createItem('0.000507551'), createItem('1.10538'), createItem('1.10538'), createItem('Open'), createItem('Market')]
  ];


}
