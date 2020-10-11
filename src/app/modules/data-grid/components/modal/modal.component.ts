import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';

@Component({
  selector: 'modal-component',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() title?: string;
  columns;
  list: TransferItem[] = [];
  defaultList = [];
  constructor(private modal: NzModalRef) {
    this.columns = modal.getConfig().nzComponentParams.columns;
  }
  ngOnInit() {
    for (const i of this.columns) {
      this.list.push({
        title: `${i}`,
      });
      this.defaultList.push({
        title: `${i}`,
      });
    }
  }
  change(ret: any): void {
    console.log('ret', ret);
    if (ret.to === 'right') {
      this.columns = ret.list.map(item => item.title);
    }
  }
  handleSubmit(ret: {}) {
    this.modal.close(this.columns);
  }
}
