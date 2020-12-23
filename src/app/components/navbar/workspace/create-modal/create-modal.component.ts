import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Workspace, WorkspaceId } from 'workspace-manager';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd';

@Component({
  selector: 'create-modal-component',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.scss'],
})
export class CreateModalComponent implements OnInit {

  workspaces: Workspace[];

  form: FormGroup;

  base: WorkspaceId = 'blank';

  constructor(private modal: NzModalRef) {
    this.workspaces = modal.getConfig().nzComponentParams.workspaces;
  }

  ngOnInit() {
    this.form = new FormGroup({
      base: new FormControl('blank'),
      workspaceName: new FormControl()
    })
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public handleOk(): void {
    this.modal.close(this.form.value);
  }

}
