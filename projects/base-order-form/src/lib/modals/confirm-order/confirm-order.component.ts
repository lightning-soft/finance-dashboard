import { Component, OnInit } from '@angular/core';
import { IInstrument, IOrder } from "trading";
import { NzModalRef } from "ng-zorro-antd/modal";
import { IFormatter, InstrumentFormatter } from "data-grid";

@Component({
  selector: 'confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent implements OnInit {
  order: IOrder;
  dontShowAgain = false;
  prefix = 'Confirm';
  instrument: IInstrument;
  formatter: IFormatter;
  limitPrice: string;
  stopPrice: string;
  showPricesDesc = false;

  constructor(private modal: NzModalRef) {
  }

  ngOnInit() {
    this.formatter = InstrumentFormatter.forInstrument(this.instrument);
    if (this.order.limitPrice != null)
      this.limitPrice = this.formatter.format(this.order.limitPrice);
    if (this.order.stopPrice != null)
      this.stopPrice = this.formatter.format(this.order.stopPrice);
    this.showPricesDesc = !!this.limitPrice && !!this.stopPrice;
  }

  submit() {
    this.modal.close({ create: true, dontShowAgain: this.dontShowAgain });
  }

  cancel() {
    this.modal.close({ create: false, dontShowAgain: this.dontShowAgain });
  }
}
