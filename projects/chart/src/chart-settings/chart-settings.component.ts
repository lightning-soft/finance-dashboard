import { AfterViewInit, Component } from '@angular/core';
import { ILayoutNode, LayoutNode } from "layout";
import { FormGroup } from "@angular/forms";
import { generalFields } from "./settings-fields";
import { IFieldConfig } from "dynamic-form";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import * as clone from 'lodash.clonedeep';
import { chartReceiveKey, defaultChartSettings, IChartSettings, IChartSettingsState } from "./settings";

export interface ChartSettingsComponent extends ILayoutNode {
}

@UntilDestroy()
@Component({
  selector: 'chart-settings',
  templateUrl: 'chart-settings.component.html',
  styleUrls: ['chart-settings.component.scss']
})
@LayoutNode()
export class ChartSettingsComponent implements AfterViewInit {
  form = new FormGroup({});
  fieldsConfig: IFieldConfig[] = clone(generalFields);
  settings: IChartSettings;

  private _linkKey: string;

  constructor() {
    this.setTabTitle('Settings Chart');
    this.setTabIcon('icon-setting-gear');
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.settings = clone(value);
        this.broadcastData(this._linkKey, this.settings);
      });
  }

  loadState(state: IChartSettingsState): void {
    this.settings = state?.settings ? state.settings : clone(defaultChartSettings);
    this._linkKey = state?.linkKey;

    this.addLinkObserver({
      link: chartReceiveKey + this._linkKey,
      handleLinkData: (data) => {
        try {
          this.settings = clone(data);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  saveState(): IChartSettingsState {
    return {
      settings: clone(this.settings),
      linkKey: this._linkKey,
    };
  }
}
