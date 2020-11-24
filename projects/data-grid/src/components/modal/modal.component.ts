import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { Column } from 'watchlist';

@Component({
  selector: 'modal-component',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() title?: string;

  public columns: Column[];

  public list: TransferItem[] = [];

  constructor(private modal: NzModalRef) {
    this.columns = modal.getConfig().nzComponentParams.columns;
  }

  ngOnInit() {
    for (const column of this.columns) {
      this.list.push({
        title: column.name,
        direction: column.visible ? 'right' : 'left',
      });
    }
  }

  public handleCancel(): void {
    this.modal.close(this.columns);
  }

  public handleOk(): void {
    this.confirmChanges();
    this.modal.close(this.columns);
  }

  private confirmChanges() {
    this.columns.map((column: Column) => {
      const atList = this.list.find(i => i.title === column.name);

      column.visible = atList.direction === 'left' ? false : true;
      return column;
    });
  }
}
