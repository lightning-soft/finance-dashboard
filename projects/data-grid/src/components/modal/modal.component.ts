import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {TransferItem} from 'ng-zorro-antd/transfer';
import {Column} from 'data-grid';

@Component({
  selector: 'modal-component',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnDestroy {
  @Input() title?: string;

  public columns: Column[];
  public showHeaders: boolean;

  constructor(private modal: NzModalRef) {
    this.columns = modal.getConfig().nzComponentParams.columns;

  }

  ngOnDestroy(): void {
    this.modal.afterClose.next({columns: [...this.columns], showHeaders: this.showHeaders});
  }

}
