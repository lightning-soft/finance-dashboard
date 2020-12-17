import { AfterViewInit, Component, OnInit, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, skip } from 'rxjs/operators';
import { Storage } from 'storage';
import { ILayoutNode, LayoutNode } from "../../../../layout";
import {
  askDeltaFields, askDepthFields, bidDeltaFields,
  bidDepthFields,
  commonFields, currentAtAskFields, currentAtBidColumnFields,
  generalFields,
  hotkeyFields,
  ltqFields, noteColumnFields, orderColumnFields,
  priceFields, totalAskDepthFields, totalBidDepthFields, volumeFields
} from './settings-fields';

export interface DomSettingsComponent extends ILayoutNode {}

enum SettingTab {
  General = 'general',
  Hotkeys = 'hotkeys',
  Columns = 'columns',
  Common = 'common',
  LTG = 'ltg',
  Price = 'price',
  BidDelta = 'bidDelta',
  AskDelta = 'askDelta',
  BidDepth = 'bidDepth',
  AskDepth = 'askDepth',
  TotalAsk = 'totalAsk',
  TotalBid = 'totalBid',
  VolumeProfile = 'volumeProfile',
  OrderColumn = 'order',
  CurrentAtBid = 'currentAtBid',
  Note = 'note',
  CurrentAtAsk = 'currentAtAsk',
}

const basePrefix = 'dom-settings';

@UntilDestroy()
@Component({
  selector: 'dom-settings',
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss']
})
@LayoutNode()
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
    {tab: SettingTab.General, config: generalFields},
    {tab: SettingTab.Common, config: commonFields},
    {tab: SettingTab.Hotkeys, config: hotkeyFields},
    {tab: SettingTab.LTG, config: ltqFields},
    {tab: SettingTab.Price, config: priceFields},
    {tab: SettingTab.BidDelta, config: bidDeltaFields},
    {tab: SettingTab.AskDelta, config: askDeltaFields},
    {tab: SettingTab.BidDepth, config: bidDepthFields},
    {tab: SettingTab.AskDepth, config: askDepthFields},
    {tab: SettingTab.TotalAsk, config: totalAskDepthFields},
    {tab: SettingTab.TotalBid, config: totalBidDepthFields},
    {tab: SettingTab.VolumeProfile, config: volumeFields},
    {tab: SettingTab.OrderColumn, config: orderColumnFields},
    {tab: SettingTab.CurrentAtBid, config: currentAtBidColumnFields},
    {tab: SettingTab.CurrentAtAsk, config: currentAtAskFields},
    {tab: SettingTab.Note, config: noteColumnFields},

  ];
  @ViewChildren('component') dynamicForms;
  form: FormGroup;

  constructor(private storage: Storage) {
    this.setTabTitle('Dom settings');
  }

  ngOnInit() {
    const formControls = this.list.map(item => item.tab).reduce((settings, item) => {
      return {...settings, [item]: new FormGroup({})};
    }, {});
    this.form = new FormGroup(formControls);

    this.form.valueChanges
      .pipe(
        skip(this.list.length),
        debounceTime(150),
        untilDestroyed(this))
      .subscribe((res) => {
        this.storage.setItem(basePrefix, res);
      });
  }

  ngAfterViewInit(): void {
    const data = this.storage.getItem(basePrefix);
    if (data) {
      for (const key in data) {
        this.form.get(key).patchValue(data[key]);
      }
    }
  }

  open(tab: SettingTab) {
    this.currentTab = tab;
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }

  getForm(tab: SettingTab) {
    return this.form.get(tab) as FormGroup;
  }
}
