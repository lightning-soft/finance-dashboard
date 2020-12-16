import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'rename-modal-component',
  templateUrl: './rename-modal.component.html',
  styleUrls: ['./rename-modal.component.scss'],
})
export class RenameModalComponent {
  workspaceName: string;

  constructor(private modal: NzModalRef) {
    this.workspaceName = modal.getConfig().nzComponentParams.workspaceName;
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public handleOk(): void {
    this.modal.close(this.workspaceName);
  }

}
