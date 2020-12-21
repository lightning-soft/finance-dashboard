import { Component, HostListener, OnInit, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ILayoutNode, IStateProvider, LayoutNode } from "../../../../layout";
import {
  askDeltaFields, askDepthFields, bidDeltaFields,
  bidDepthFields,
  commonFields, currentAtAskFields, currentAtBidColumnFields,
  generalFields,
  hotkeyFields,
  ltqFields, noteColumnFields, orderColumnFields,
  priceFields, totalAskDepthFields, totalBidDepthFields, volumeFields
} from './settings-fields';
import { DomSettingsStore } from "./dom-settings.store";

export interface DomSettingsComponent extends ILayoutNode {
}

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


@UntilDestroy()
@Component({
  selector: 'dom-settings',
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss']
})
@LayoutNode()
export class DomSettingsComponent implements IStateProvider<any> {
  currentTab = SettingTab.General;
  tabs = SettingTab;

  list = [
    {tab: SettingTab.General, label: 'General', config: generalFields},
    {tab: SettingTab.Common, label: 'Common', config: commonFields},
    {tab: SettingTab.Hotkeys, label: 'Hotkeys', config: hotkeyFields},
    {
      label: 'Columns', children: [
        {tab: SettingTab.LTG, label: 'LTQ', config: ltqFields},
        {tab: SettingTab.Price, label: 'Price', config: priceFields},
        {tab: SettingTab.BidDelta, label: 'Bid Delta', config: bidDeltaFields},
        {tab: SettingTab.AskDelta, label: 'Ask Delta', config: askDeltaFields},
        {tab: SettingTab.BidDepth, label: 'Bid Depth', config: bidDepthFields},
        {tab: SettingTab.AskDepth, label: 'Ask Depth', config: askDepthFields},
        {tab: SettingTab.TotalAsk, label: 'Total At Ask', config: totalAskDepthFields},
        {tab: SettingTab.TotalBid, label: 'Total At Bid', config: totalBidDepthFields},
        {tab: SettingTab.VolumeProfile, label: 'Volume Profile', config: volumeFields},
        {tab: SettingTab.OrderColumn, label: 'Order', config: orderColumnFields},
        {tab: SettingTab.CurrentAtBid, label: 'Current At Bid', config: currentAtBidColumnFields},
        {tab: SettingTab.CurrentAtAsk, label: 'Current At Ask', config: currentAtAskFields},
        {tab: SettingTab.Note, label: 'Notes', config: noteColumnFields}]
    },
  ];

  @ViewChildren('component') dynamicForms;
  form: FormGroup;
  currentConfig: any;
  model = {};

  constructor(private storage: DomSettingsStore) {
    this.setTabTitle('Dom settings');
  }

  open(item) {
    if (this.currentTab !== item.tab) {
      this.currentTab = item.tab;
      this.currentConfig = item.config;
    }
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }

  saveState() {
   /* this.storage.setSettings(this.model)
      .toPromise();*/
    return this.model;
  }

  loadState(state: any) {
    this.currentConfig = this.list[0].config;
    this.model = state;

  /*  this.storage.getSettings().toPromise()
      .then((data) => {
        if (data) {
          console.warn(data);
          this.model = data;
        }
      });*/

  }

  getForm(currentTab: SettingTab) {
    return this.form.get(currentTab) as FormGroup;
  }
}
