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
import { combineLatest } from 'rxjs';
import { skip, startWith } from 'rxjs/operators';

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

const basePrefix = 'dom-settings';

@UntilDestroy()
@Component({
  selector: 'dom-settings',
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss']
})
export class DomSettingsComponent implements AfterViewInit, OnInit {
  currentTab = SettingTab.General;
  tabs = SettingTab;
  submenuItems = [
    {tab: SettingTab.Common, label: 'Common'},
    {tab: SettingTab.LTG, label: 'LQT'},
    {tab: SettingTab.Price, label: 'Price'},
    {tab: SettingTab.BidDelta, label: 'Bid Delta'},
    {tab: SettingTab.AskDelta, label: 'Ask Delta'},
    {tab: SettingTab.BidDepth, label: 'Bid Depth'},
    {tab: SettingTab.AskDepth, label: 'Ask Depth'},
    {tab: SettingTab.TotalAsk, label: 'Total At Ask'},
    {tab: SettingTab.TotalBid, label: 'Total At Bid'},
    {tab: SettingTab.VolumeProfile, label: 'Volume Profile'},
    {tab: SettingTab.OrderColumn, label: 'Orders'},
    {tab: SettingTab.CurrentAtBid, label: 'Current At Bid'},
    {tab: SettingTab.CurrentAtAsk, label: 'Current At Ask'},
    {tab: SettingTab.Note, label: 'Note'},
  ];
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
    const storageData = this.storage.getItem(basePrefix);
    if (!storageData)
      return;
    this.list.forEach((item) => {
      const data = storageData[item.key];
      item.config.forEach(config => {
        const value = data[config.name];
        if (value) {
          config.value = value;
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // startWith and skip is used because combineLatest does not emit value until at least each child emits one
    combineLatest(this.dynamicForms.map(item => {
      return item.form.valueChanges.pipe(startWith(item.form.value));
    }))
      .pipe(
        skip(1),
        untilDestroyed(this)
      )
      .subscribe((res) => {
        const result = res.reduce((settings, item, index) => {
          const obj = {[this.list[index].key]: item};
          // @ts-ignore
          return {...settings, ...obj};
        }, {});
        this.storage.setItem(basePrefix, result);

      });
  }

  open(tab: SettingTab) {
    this.currentTab = tab;
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }
}
