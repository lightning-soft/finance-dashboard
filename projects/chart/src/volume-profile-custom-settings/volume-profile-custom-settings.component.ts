import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ItemsComponent, mergeDeep } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import * as clone from 'lodash.clonedeep';
import { NzModalService } from 'ng-zorro-antd';
import { debounceTime } from 'rxjs/operators';
import { ConfirmModalComponent, RenameModalComponent } from 'ui';
import { customVolumeProfile } from './config';
import { IVolumeTemplate, VolumeProfileTemplatesRepository } from './volume-profile-templates.repository';

export const customVolumeProfileSettings = 'customVolumeProfileSettings';

export interface VolumeProfileCustomSettingsComponent extends ILayoutNode {
}


export interface ICustomVolumeProfileSettingsState {
  identificator: any;
  template: Partial<IVolumeTemplate>;
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
  selectedItem: IVolumeTemplate;
  private _identificator: any; // scx indicator or volume template

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

    (window as any).bla = this;
  }

  loadState(state: ICustomVolumeProfileSettingsState): void {
    this.selectItem(state?.template as IVolumeTemplate);
    this._linkKey = state?.linkKey;
    this._identificator = state.identificator;

    this.addLinkObserver({
      link: this._linkKey,
      listener: this,
      handleLinkData: (data) => {
        if (!data)
          return;

        try {
          console.log('data', data);
          this.selectItem(data.template as IVolumeTemplate);
          this._identificator = data.identificator;
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  saveState() {
    return {
      link: this._linkKey,
      template: this.selectedItem,
     //  identificator: this._identificator
    };
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .pipe(untilDestroyed(this), debounceTime(100))
      .subscribe((value) => {
        this.settings = mergeDeep(this.settings, clone(value));
        const template = {
          ...this.selectedItem,
          settings: normalizeSettings(this.settings),
        };

        if (template.id != null) {
          this._repository.updateItem(template).subscribe(
            () => console.log('Updated'),
            err => console.error('Updated err', err),
          );
        }

        this.broadcastData(this._linkKey,
          {
            identificator: this._identificator,
            template,
          }
        );
      });
  }

  selectItem(item: IVolumeTemplate) {
    this._identificator = item;
    this.selectedItem = item;
    if (item?.settings)
      this.settings = denormalizeSettings(item.settings);
  }

  rename(template: IVolumeTemplate) {
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

    modal.afterClose.subscribe(name => {
      if (!name)
        return;

      this._repository.updateItem({ ...template, name }).subscribe();
    });
  }

  delete(template: IVolumeTemplate) {
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
        this._repository.deleteItem(template.id as any).subscribe();
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
    profile: {
      ...value.profile,
      widthCorrelation: fn(value?.profile?.widthCorrelation),
      vaInsideOpacity: fn(value?.profile?.vaInsideOpacity),
      vaOutsideOpacity: fn(value?.profile?.vaOutsideOpacity),
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
