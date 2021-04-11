import { Component, OnInit } from '@angular/core';
import { IOrder } from "trading";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: 'confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent implements OnInit {
  order: IOrder;
  dontShowAgain = false;

  constructor(private modal: NzModalRef) {
  }

  ngOnInit(): void {
  }

  submit() {
    this.modal.close({ create: true, dontShowAgain: this.dontShowAgain });
  }

  cancel() {
    this.modal.close({ create: false, dontShowAgain: this.dontShowAgain });
  }
}
