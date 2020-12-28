import { Component, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyForm } from '@ngx-formly/core';
import { ILayoutNode, IStateProvider, LayoutNode } from "layout";
import { SettingsConfig, SettingTab } from './settings-fields';

export interface DomSettingsComponent extends ILayoutNode {
}

export const DomSettingsSelector = 'dom-settings';

@UntilDestroy()
@Component({
  selector: DomSettingsSelector,
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss']
})
@LayoutNode()
export class DomSettingsComponent implements IStateProvider<any> {
  list = [
    { tab: SettingTab.General, label: 'General' },
    { tab: SettingTab.Common, label: 'Common' },
    { tab: SettingTab.Hotkeys, label: 'Hotkeys' },
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
        { tab: SettingTab.Note, label: 'Notes' }]
    },
  ];

  @ViewChild('form')
  form: FormlyForm;

  settings: any;

  selectedSettings: any;
  selectedConfig: any;
  currentTab: SettingTab;

  constructor() {
    this.setTabTitle('Dom settings');
  }

  ngAfterViewInit() {
    this.form.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(v => this._handleChange(v));
  }

  private _handleChange(value: any) {
    this.settings[this.currentTab] = value;
    this.broadcastData(DomSettingsSelector, { [this.currentTab]: value });
  }

  select(item) {
    if (this.currentTab == item.tab)
      return;

    this.currentTab = item.tab;
    this.selectedSettings = this.settings[item.tab];
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
  }
}

function deepClone(state: any) {
  if (Array.isArray(state))
    return state.map(deepClone);

  if (typeof state == 'object')
    return {
      ...state,
    }

  return state;
}
