import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyForm } from '@ngx-formly/core';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { SettingsConfig, SettingTab } from './settings-fields';
import { debounceTime } from 'rxjs/operators';

export interface DomSettingsComponent extends ILayoutNode {
}

export const DomSettingsSelector = 'dom-settings';

interface IDomSettingsState {
  settings?: any;
  componentInstanceId?: number,
}

@UntilDestroy()
@Component({
  selector: DomSettingsSelector,
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss'],
  providers: []
})
@LayoutNode()
export class DomSettingsComponent implements IStateProvider<IDomSettingsState>, AfterViewInit {
  list = [
    { tab: SettingTab.General, label: 'General' },
    { tab: SettingTab.Hotkeys, label: 'Hotkeys' },
    { tab: SettingTab.OrderArea, label: 'Order Area' },
    {
      label: 'Columns',
      children: [
        { tab: SettingTab.Common, label: 'Common' },
        { tab: SettingTab.LTQ, label: 'LTQ' },
        { tab: SettingTab.Price, label: 'Price' },
        { tab: SettingTab.BidDelta, label: 'Bid Delta' },
        { tab: SettingTab.AskDelta, label: 'Ask Delta' },
        { tab: SettingTab.Bid, label: 'Bid Depth' },
        { tab: SettingTab.Ask, label: 'Ask Depth' },
        // { tab: SettingTab.Bid, label: 'Bid' },
        // { tab: SettingTab.Ask, label: 'Ask' },
        { tab: SettingTab.TotalAsk, label: 'Total At Ask' },
        { tab: SettingTab.TotalBid, label: 'Total At Bid' },
        { tab: SettingTab.Volume, label: 'Volume Profile' },
        { tab: SettingTab.Orders, label: 'Order' },
        { tab: SettingTab.CurrentAtBid, label: 'Current At Bid' },
        { tab: SettingTab.CurrentAtAsk, label: 'Current At Ask' },
        { tab: SettingTab.Note, label: 'Notes' },
      ]
    },
  ];

  @ViewChild('form')
  form: FormlyForm;

  settings: any;
  componentInstanceId: number;

  selectedConfig: any;
  currentTab: SettingTab;

  constructor() {
    this.setTabTitle('DOM settings');
    this.setTabIcon('icon-setting-gear');
  }

  ngAfterViewInit() {
    this.form.form.valueChanges
      .pipe(
        debounceTime(10),
        untilDestroyed(this)
      )
      .subscribe(v => this._handleChange(v));
  }

  private _handleChange(value: any) {
    // this.broadcastData(DomSettingsSelector + this.componentInstanceId, this.settings);
    this.broadcastData(DomSettingsSelector, this.settings);
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
    return {
      settings: this.settings,
      // componentInstanceId: this.componentInstanceId
    };
  }

  loadState(state: IDomSettingsState) {
    this.settings = deepClone(state.settings) ?? {};
    this.componentInstanceId = state.componentInstanceId;
    this.select(this.list[0]);
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
