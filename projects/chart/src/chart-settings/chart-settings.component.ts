import { AfterViewInit, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { mergeDeep } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import * as clone from 'lodash.clonedeep';
import { chartReceiveKey, defaultChartSettings, IChartSettings, IChartSettingsState } from './settings';
import { generalFields, sessionFields, tradingFields, valueScale } from './settings-fields';

export interface ChartSettingsComponent extends ILayoutNode {
}

export enum SettingsItems {
  General,
  ChartTrading,
  TradingHours,
  ValueScale,
}

const valueScaleMenuItem = {
  name: 'Value Scale',
  config: clone(valueScale),
  className: 'value-scale'
};

@UntilDestroy()
@Component({
  selector: 'chart-settings',
  templateUrl: 'chart-settings.component.html',
  styleUrls: ['chart-settings.component.scss']
})
@LayoutNode()
export class ChartSettingsComponent implements AfterViewInit {
  form = new FormGroup({});
  settings: IChartSettings;

  menuItems = [
    {
      name: 'General',
      config: clone(generalFields),
      className: ''
    },
    {
      name: 'Chart Trading',
      config: clone(tradingFields),
      className: 'chart-trading'
    },
    {
      name: 'Trading Hours',
      config: clone(sessionFields)
    },
    valueScaleMenuItem
  ];
  currentItem = this.menuItems[0];

  private _linkKey: string;

  get linkKey() {
    return this._linkKey;
  }

  constructor() {
    this.setTabTitle('Settings Chart');
    this.setTabIcon('icon-setting-gear');
    this.setIsSettings(true);
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.settings = mergeDeep(this.settings, clone(value));
        this.broadcastData(this._linkKey, this.settings);
      });
  }

  loadState(state: IChartSettingsState): void {
    this.settings = state?.settings ? state.settings : clone(defaultChartSettings);
    this._linkKey = state?.linkKey;
    if (state.menuItem != null) {
      this.selectItem(this.menuItems[state.menuItem]);
    }

    this.addLinkObserver({
      link: chartReceiveKey + this._linkKey,
      handleLinkData: (data) => {
        if (data.type === SettingsItems.ValueScale) {
          this.selectItem(valueScaleMenuItem);
          return;
        }
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

  selectItem(item) {
    if (this.currentItem !== item)
      this.currentItem = item;
  }
}
