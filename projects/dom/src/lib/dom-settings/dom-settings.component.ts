import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyForm } from '@ngx-formly/core';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { CssApplier } from '../css.applier';
import { SettingsConfig, SettingTab } from './settings-fields';
import { debounceTime } from 'rxjs/operators';

export interface DomSettingsComponent extends ILayoutNode {
}

export const DomSettingsSelector = 'dom-settings';


@UntilDestroy()
@Component({
  selector: DomSettingsSelector,
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss'],
  providers: []
})
@LayoutNode()
export class DomSettingsComponent implements IStateProvider<any>, AfterViewInit {
  list = [
    { tab: SettingTab.General, label: 'General' },
    { tab: SettingTab.Common, label: 'Common' },
    { tab: SettingTab.Hotkeys, label: 'Hotkeys' },
    { tab: SettingTab.OrderArea, label: 'Order Area' },
    {
      label: 'Columns',
      children: [
        { tab: SettingTab.LTQ, label: 'LTQ' },
        { tab: SettingTab.Price, label: 'Price' },
        { tab: SettingTab.BidDelta, label: 'Bid Delta' },
        { tab: SettingTab.AskDelta, label: 'Ask Delta' },
        { tab: SettingTab.BidDepth, label: 'Bid Depth' },
        { tab: SettingTab.AskDepth, label: 'Ask Depth' },
        { tab: SettingTab.Bid, label: 'Bid' },
        { tab: SettingTab.Ask, label: 'Ask' },
        { tab: SettingTab.TotalAsk, label: 'Total At Ask' },
        { tab: SettingTab.TotalBid, label: 'Total At Bid' },
        { tab: SettingTab.VolumeProfile, label: 'Volume Profile' },
        { tab: SettingTab.OrderColumn, label: 'Order' },
        { tab: SettingTab.CurrentAtBid, label: 'Current At Bid' },
        { tab: SettingTab.CurrentAtAsk, label: 'Current At Ask' },
        { tab: SettingTab.Note, label: 'Notes' },
      ]
    },
  ];

  @ViewChild('form')
  form: FormlyForm;

  settings: any;

  selectedConfig: any;
  currentTab: SettingTab;

  constructor(private _applier: CssApplier) {
    this.setTabTitle('Dom settings');
    this.setTabIcon('icon-setting-gear');
  }

  ngAfterViewInit() {
    this._applyCss();

    this.form.form.valueChanges
      .pipe(
        debounceTime(10),
        untilDestroyed(this)
      )
      .subscribe(v => this._handleChange(v));
  }

  private _handleChange(value: any) {
    this.broadcastData(DomSettingsSelector, this.settings);
    this._applyCss();
  }

  private _applyCss() {
    let cssData = {};
    for (let configKey in SettingsConfig) {
      const configs = SettingsConfig[configKey];
      cssData = {
        ...cssData,
        ...configs.filter(item => item?.getCss).map(c => c?.getCss(this.settings))
          .reduce((current, total) => {
            total = { ...total, current };
            return total;
          }, {})
      };
    }
    this._applier.apply('lib-dom', cssData, 'dom-settings');
  }


  select(item) {
    if (this.currentTab == item.tab)
      return;

    this.currentTab = item.tab;
    this.selectedConfig = SettingsConfig[item.tab];
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }

  saveState() {
    return this.settings;
  }

  loadState(state: any) {
    this.settings = deepClone(state) ?? {};
    this.select(this.list[0]);
    this._applyCss();
  }
}

function deepClone(state: any) {
  if (Array.isArray(state))
    return state.map(deepClone);

  if (typeof state == 'object')
    return {
      ...state,
    };

  return state;
}
