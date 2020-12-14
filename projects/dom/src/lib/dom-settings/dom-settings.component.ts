import { AfterViewInit, Component, OnInit, ViewChildren } from '@angular/core';
import { Storage } from 'storage';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  askDeltaFields, askDepthFields, bidDeltaFields,
  bidDepthFields,
  commonFields, currentAtAskFields, currentAtBidColumnFields,
  generalFields,
  hotkeyFields,
  ltqFields, noteColumnFields, orderColumnFields,
  priceFields, totalAskDepthFields, totalBidDepthFields, volumeFields
} from './settings-fields';

enum SettingTab {
  General, Hotkeys, Columns, Common, LTG, Price,
  BidDelta,
  AskDelta,
  BidDepth,
  AskDepth,
  TotalAsk,
  TotalBid,
  VolumeProfile,
  OrderColumn,
  CurrentAtBid,
  Note,
  CurrentAtAsk,
}

const basePrefix = 'dom-settings.';

@UntilDestroy()
@Component({
  selector: 'dom-settings',
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss']
})
export class DomSettingsComponent implements AfterViewInit, OnInit {
  currentTab = SettingTab.General;
  tabs = SettingTab;


  list = [
    {tab: SettingTab.General, key: 'general', config: generalFields},
    {tab: SettingTab.Common, key: 'common', config: commonFields},
    {tab: SettingTab.Hotkeys, key: 'hotkeys', config: hotkeyFields},
    {tab: SettingTab.LTG, key: 'LTG', config: ltqFields},
    {tab: SettingTab.Price, key: 'Price', config: priceFields},
    {tab: SettingTab.BidDelta, key: 'BidDelta', config: bidDeltaFields},
    {tab: SettingTab.AskDelta, key: 'AskDelta', config: askDeltaFields},
    {tab: SettingTab.BidDepth, key: 'BidDepth', config: bidDepthFields},
    {tab: SettingTab.AskDepth, key: 'AskDepth', config: askDepthFields},
    {tab: SettingTab.TotalAsk, key: 'TotalAsk', config: totalAskDepthFields},
    {tab: SettingTab.TotalBid, key: 'TotalBid', config: totalBidDepthFields},
    {tab: SettingTab.VolumeProfile, key: 'VolumeProfile', config: volumeFields},
    {tab: SettingTab.OrderColumn, key: 'OrderColumn', config: orderColumnFields},
    {tab: SettingTab.CurrentAtBid, key: 'CurrentAtBid', config: currentAtBidColumnFields},
    {tab: SettingTab.CurrentAtAsk, key: 'CurrentAtAsk', config: currentAtAskFields},
    {tab: SettingTab.Note, key: 'Note', config: noteColumnFields},

  ];

  @ViewChildren('component') dynamicForms;

  constructor(private storage: Storage) {
  }

  ngOnInit() {
    this.list.forEach((item, index) => {
      const data = this.storage.getItem(basePrefix + this.list[index].key);
      if (!data)
        return;
      item.config.forEach(config => {
        const value = data[config.name];
        if (value) {
          config.value = value;
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.dynamicForms.map((item, index) => {
      item.form.valueChanges
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          this.storage.setItem(basePrefix + this.list[index].key, res);
        });
    });
  }

  open(tab: SettingTab) {
    this.currentTab = tab;
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }
}
