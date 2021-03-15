import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { blankBase, WorkspaceId } from 'workspace-manager';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'create-modal-component',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.scss'],
})
export class CreateModalComponent implements OnInit {

  options: { label: string, value: any }[];

  form: FormGroup;

  base: WorkspaceId = blankBase;
  name: string;
  blankOption: string;

  constructor(private modal: NzModalRef) {
    this.options = modal.getConfig().nzComponentParams.options;
  }

  ngOnInit() {
    this.form = new FormGroup({
      base: new FormControl('blank'),
      name: new FormControl()
    });
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public handleOk(): void {
    this.modal.close(this.form.value);
  }

}
