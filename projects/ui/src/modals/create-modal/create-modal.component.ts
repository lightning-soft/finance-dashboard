import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Id } from 'communication';

export const blankBase = 'blank';


@Component({
  selector: 'create-modal-component',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.scss'],
})
export class CreateModalComponent implements OnInit {
  options: { label: string, value: any }[];
  form: FormGroup;
  base: Id = blankBase;
  name: string;
  blankOption: string;

  constructor(private modal: NzModalRef) {
    this.options = modal.getConfig().nzComponentParams.options;
  }

  ngOnInit() {
    this.form = new FormGroup({
      base: new FormControl('blank'),
      name: new FormControl('', [Validators.required])
    });
  }

  public handleCancel(): void {
    this.modal.close();
  }

  public handleOk(): void {
    this.modal.close(this.form.value);
  }

}
