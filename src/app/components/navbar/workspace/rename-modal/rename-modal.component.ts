import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'rename-modal-component',
  templateUrl: './rename-modal.component.html',
  styleUrls: ['./rename-modal.component.scss'],
})
export class RenameModalComponent {
  name: string;
  label = 'Name';

  constructor(private modal: NzModalRef) {
    this.name = modal.getConfig().nzComponentParams.name;
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public handleOk(): void {
    this.modal.close(this.name);
  }

}
