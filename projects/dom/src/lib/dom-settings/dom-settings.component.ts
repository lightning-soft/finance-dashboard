import { Component, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SettingsConfig, SettingTab } from './settings-fields';
import { DomSettings } from './settings';

export interface DomSettingsComponent extends ILayoutNode {
}

export const DomSettingsSelector = 'dom-settings';

interface IDomSettingsState {
  settings?: any;
  linkKey?: string;
}

export interface IDomSettingsEvent {
  action: 'close';
  linkKey: string;
}

export const receiveSettingsKey = 'receiveSettings_';

@UntilDestroy()
@Component({
  selector: DomSettingsSelector,
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss'],
  providers: []
})
@LayoutNode()
export class DomSettingsComponent implements IStateProvider<IDomSettingsState>, OnDestroy {
  link = DomSettingsSelector;
  formValueChangesSubscription: Subscription;
  list = [
    { tab: SettingTab.General, label: 'General' },
    { tab: SettingTab.Hotkeys, label: 'Hotkeys' },
    { tab: SettingTab.Trading, label: 'Trading' },
    {
      label: 'Columns',
      expanded: true,
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
        { tab: SettingTab.Orders, label: 'Orders' },
        { tab: SettingTab.CurrentAtBid, label: 'Current At Bid' },
        { tab: SettingTab.CurrentAtAsk, label: 'Current At Ask' },
        // { tab: SettingTab.Note, label: 'Notes' },
      ]
    },
  ];
  settingsConfig = clone(SettingsConfig);

  form: FormGroup;

  settings: any;
  _linkKey: string;

  selectedConfig: any;
  currentTab: SettingTab;
  currentMenuItem;

  settingsTab = SettingTab;

  constructor() {
    this.setTabTitle('Settings DOM');
    this.setTabIcon('icon-setting-gear');
    this.setIsSettings(true);
  }


  private _handleChange(value: any) {
    if (!this._linkKey)
      console.error('Invalid link key', this._linkKey);
    this.settings = { ...this.settings, ...value };
    this.broadcastData(this._linkKey, this.settings);
  }


  select(item) {
    if (this.currentTab == item.tab)
      return;

    this.currentTab = item.tab;
    this.currentMenuItem = item;
    this.selectedConfig = this.settingsConfig[item.tab];

    this.formValueChangesSubscription?.unsubscribe();
    this.form = new FormGroup({});
    this.formValueChangesSubscription = this.form.valueChanges
      .pipe(
        debounceTime(10),
        untilDestroyed(this))
      .subscribe((v) => {
        this._handleChange(v);
      });
  }

  isTabActive(item) {
    return this.currentTab === item.tab;
  }

  isSubMenuActive(item) {
    return item.children?.some(subItem => subItem.tab === this.currentTab);
  }

  saveState() {
    return {
      settings: this.settings,
      linkKey: this._linkKey,
    };
  }

  loadState(_state: IDomSettingsState) {
    const state = clone(_state);
    this.settings = state.settings ?? {};
    this._linkKey = state.linkKey;
    this.select(this.list[0]);
    this.addLinkObserver({
      link: receiveSettingsKey + this._linkKey,
      handleLinkData: (res: DomSettings) => {
        try {
          this.settings = res.toJson();
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  handleLinkData(data: IDomSettingsEvent) {
    if (data.action === 'close' && this._linkKey == data.linkKey) {
      this.close();
    }
  }

  toggleMenuItem(item) {
    if (item.children) {
      item.expanded = !item.expanded;
    } else {
      this.select(item);
    }
  }

  clearAll() {
    Object.keys(this.settings.hotkeys).forEach((key) => {
        this.settings.hotkeys[key] = null;
    });
    this.form.patchValue(this.settings);
  }

// need for correct work of untilDestroyed
  ngOnDestroy() {
  }

}

function clone(data) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}
