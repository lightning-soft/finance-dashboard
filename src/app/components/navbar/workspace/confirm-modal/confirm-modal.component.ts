import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'confirm-modal-component',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
  message: string;
  confirmText = 'Save';
  cancelText = 'Cancel';

  constructor(private modal: NzModalRef) {
    this.message = this.modal.getConfig().nzComponentParams.message;
  }

  public handleCancel(): void {
    this.modal.close({ confirmed: false });
  }

  public handleOk(): void {
    this.modal.close({ confirmed: true });
  }

}
