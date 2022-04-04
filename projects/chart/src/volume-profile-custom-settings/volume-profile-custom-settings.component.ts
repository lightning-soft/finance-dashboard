import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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
import { IChart } from '../models';

export const customVolumeProfileSettings = 'customVolumeProfileSettings';

export interface VolumeProfileCustomSettingsComponent extends ILayoutNode {
}


export interface ICustomVolumeProfileSettingsState {
  identificator: any;
  template: Partial<IVolumeTemplate>;
  linkKey: string;
  chart?: IChart;
}

declare let StockChartX: any;

@Component({
  selector: 'volume-profile-custom-settings',
  templateUrl: './volume-profile-custom-settings.component.html',
  styleUrls: ['./volume-profile-custom-settings.component.scss']
})
@LayoutNode()
@UntilDestroy()
export class VolumeProfileCustomSettingsComponent extends ItemsComponent<IVolumeTemplate> implements OnInit, OnDestroy, AfterViewInit {
  menuItems = [];

  formConfig = customVolumeProfile;
  form = new FormGroup({});

  settings: any = {};
  chart: IChart;
  unnamedIndicators = [];

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
    this._handleChart(state.chart);
    this._linkKey = state?.linkKey;
    this._identificator = state.identificator;

    this.addLinkObserver({
      link: this._linkKey,
      listener: this,
      handleLinkData: (data) => {
        if (!data)
          return;

        try {
          this.selectItem(data.template as IVolumeTemplate);
          this._handleChart(data.chart);
          this._identificator = data.identificator;
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  private _handleChart(chart: IChart) {
    if (this.chart || chart == null)
      return;

    this.chart = chart;
    this.chart.on(StockChartX.ChartEvent.INDICATOR_ADDED, this._handleIndicatorAdd);
    this.chart.on(StockChartX.ChartEvent.INDICATOR_REMOVED, this._handleIndicatorRemove);
    setTimeout(() => {
      this.unnamedIndicators = this.chart.indicators.filter((item) => isCVP(item));
      const currentItem = this.unnamedIndicators.find(item => item == this._identificator);
      if (this.selectedItem == null && currentItem)
        this.selectUntemplated(currentItem);
    });
  }

  _handleIndicatorAdd = ({ value }) => {
    if (isCVP(value) && !this.unnamedIndicators.includes(value))
      this.unnamedIndicators.push(value);
  }
  _handleIndicatorRemove = ({ value }) => {
    if (isCVP(value))
      this.unnamedIndicators = this.unnamedIndicators.filter(item => item != value);
  }

  saveState() {
    return {
      linkKey: this._linkKey,
      template: this.selectedItem,
      //  identificator: this._identificator
    };
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .pipe(untilDestroyed(this), debounceTime(100))
      .subscribe((value) => {
        this.settings = mergeDeep(this.settings, clone(value));
        if (this.selectedItem?.isUntemplated) {
          this.selectedItem.instance.settings = normalizeSettings(this.settings);
          return;
        }
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
    if (item?.settings) {
      this.settings = denormalizeSettings(item.settings);
      this.form.patchValue(this.settings);
    }
  }

  selectUntemplated(item) {
    this.selectedItem = { settings: item.settings, isUntemplated: true, instance: item } as any;
    this.settings = denormalizeSettings(item.settings);
    this.form.patchValue(this.settings);
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

  save() {
    if (this.selectedItem.id == null) {
      const modal = this._modalService.create({
        nzTitle: 'Save as',
        nzContent: RenameModalComponent,
        nzClassName: 'modal-dialog-workspace',
        nzWidth: 438,
        nzWrapClassName: 'vertical-center-modal',
        nzComponentParams: {
          label: 'Template name',
        },
      });

      modal.afterClose.subscribe(result => {
        if (!result)
          return;

        const template: IVolumeTemplate = {
          id: Date.now().toString(),
          name: result,
          settings: normalizeSettings(this.settings),
        };
        this._repository.createItem(template).subscribe((res) => {
          this._identificator.templateId = res.id;
          this.selectedItem.id = res.id;
          this.selectedItem.name = res.name;
          if (this.selectedItem.isUntemplated) {
            this.selectedItem.isUntemplated = false;
            this.unnamedIndicators = this.unnamedIndicators.filter(item => item !== this.selectedItem.instance);
            this.selectedItem.instance.templateId = res.id;
            this.selectedItem.instance = null;
           // this.selectItem(this.selectedItem);
          }

        }, error => this._notifier.showError(error, 'Failed to create Template'));
      });
    } else {
      this._repository.updateItem(this.selectedItem)
        .pipe(untilDestroyed(this))
        .subscribe((res) => {
          this.selectedItem = res;
        });
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.chart?.off(StockChartX.ChartEvent.INDICATOR_ADDED, this._handleIndicatorAdd);
    this.chart?.off(StockChartX.ChartEvent.INDICATOR_REMOVED, this._handleIndicatorRemove);
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

function isCVP(item) {
  return item.templateId == null && item.className === StockChartX.CustomVolumeProfile.className;
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
