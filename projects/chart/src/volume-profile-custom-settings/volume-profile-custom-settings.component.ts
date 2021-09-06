import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { mergeDeep } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import * as clone from 'lodash.clonedeep';
import { NzModalService } from 'ng-zorro-antd';
import { ConfirmModalComponent, RenameModalComponent } from 'ui';
import { ItemsComponent } from 'base-components';
import { customVolumeProfile } from './config';
import { IVolumeTemplate, VolumeProfileTemplatesRepository } from './volume-profile-templates.repository';

export const customVolumeProfileSettings = 'customVolumeProfileSettings';


export interface VolumeProfileCustomSettingsComponent extends ILayoutNode {
}


export interface ICustomVolumeProfileSettingsState {
  indicator: {
    settings: any
  };
  linkKey: string;
}

@Component({
  selector: 'volume-profile-custom-settings',
  templateUrl: './volume-profile-custom-settings.component.html',
  styleUrls: ['./volume-profile-custom-settings.component.scss']
})
@LayoutNode()
@UntilDestroy()
export class VolumeProfileCustomSettingsComponent extends ItemsComponent<IVolumeTemplate> implements OnInit, AfterViewInit {
  menuItems = [];

  formConfig = customVolumeProfile;
  form = new FormGroup({});

  settings: any = {};

  private _linkKey: string;

  get linkKey() {
    return this._linkKey;
  }

  constructor(
    private _modalService: NzModalService,
    protected _repository: VolumeProfileTemplatesRepository,
  ) {
    super();
    this.autoLoadData = {
      onInit: true,
      onParamsChange: false,
      onQueryParamsChange: false,
      onConnectionChange: false,
    };
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setTabTitle('Drawing Objects');
  }

  loadState(state: ICustomVolumeProfileSettingsState): void {
    console.log(state);
    this._linkKey = state?.linkKey;

    this.settings = denormalizeSettings(state.indicator.settings);

    this.addLinkObserver({
      link: this._linkKey,
      handleLinkData: (data) => {
        if (!data)
          return;

        try {
          console.log('data', data);
          this.settings = denormalizeSettings(data);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.settings = mergeDeep(this.settings, clone(value));
        this.broadcastData(this._linkKey, normalizeSettings(this.settings));
      });
  }

  saveState() {

  }

  selectItem(item: IVolumeTemplate) {
    this.settings = denormalizeSettings(item.settings);
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

function changeSettings(value: any, fn) {
  return clone({
    ...value,
    general: {
      ...value.general,
      vaCorrelation: fn(value?.general?.vaCorrelation),
    },
    profileSettings: {
      ...value.profileSettings,
      widthCorrelation: fn(value?.profileSettings?.widthCorrelation),
      vaInsideOpacity: fn(value?.profileSettings?.vaInsideOpacity),
      vaOutsideOpacity: fn(value?.profileSettings?.vaOutsideOpacity),
    }
  });
}

function denormalizeSettings(value: any) {
  return changeSettings(value, toPercent);
}

function normalizeSettings(value: any) {
  return changeSettings(value, fromPercent);
}


function toPercent(value) {
  return (value ?? 0) * 100;
}

function fromPercent(value) {
  return value == null ? 0 : value / 100;
}
