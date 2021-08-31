import { Component, OnInit } from '@angular/core';
import { ILayoutNode, LayoutNode } from 'layout';
import { customVolumeProfile } from './config';
import { FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd';
import { ConfirmModalComponent, RenameModalComponent } from 'ui';

export const customVolumeProfileSettings = 'customVolumeProfileSettings';


export interface VolumeProfileCustomSettingsComponent extends ILayoutNode {
}

@Component({
  selector: 'volume-profile-custom-settings',
  templateUrl: './volume-profile-custom-settings.component.html',
  styleUrls: ['./volume-profile-custom-settings.component.scss']
})
@LayoutNode()
export class VolumeProfileCustomSettingsComponent implements OnInit {
  menuItems = [
    { name: 'BuyVolProf', className: '', settings: {} },
    {
      name: 'SellVolProf',
      className: '',
      settings: {}
    }];
  currentItem = this.menuItems[0];
  config = customVolumeProfile;
  form = new FormGroup({});

  constructor(
    private _modalService: NzModalService,
  ) {
  }

  ngOnInit(): void {
    this.setTabTitle('Drawing Objects');
  }

  saveState() {

  }

  selectItem(item: { name: string }) {

  }

  rename() {
    const modal = this._modalService.create({
      nzTitle: 'Edit name',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        label: 'Template name',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result !== '') {
      }
    });
  }

  delete() {
    const modal = this._modalService.create({
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the template?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result.confirmed) {
      }
    });
  }
}
