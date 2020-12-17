import { AfterViewInit, Component, OnInit, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from "@ngx-formly/core";
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
  formControls: any;
  currentForm: FormGroup;
  currentConfig: FormlyFieldConfig[];

  constructor(private storage: Storage) {
    this.setTabTitle('Dom settings');
  }

  ngOnInit() {

    /**
     * Think about refactor!
     */
    this.formControls = this.list
      .reduce((list, item) => {
        if (item.children) {
          return [...list, ...item.children];
        }
        return [...list, item];
      }, [])
      .map(item => item.tab)
      .reduce((settings, item) => {
        return {...settings, [item]: new FormGroup({})};
      }, {});

    this.currentTab = SettingTab.General;
    this.currentForm = this.formControls[SettingTab.General];
    this.currentConfig = this.list[0].config;
  }

  ngAfterViewInit(): void {
    this.updateCurrentForm();
  }

  updateCurrentForm() {
    const storageData = this.storage.getItem(basePrefix);
    if (storageData) {
      const data = storageData[this.currentTab];
      if (data)
        this.currentForm.patchValue(data);
    }
  }

  open(item) {
    if (this.currentTab !== item.tab) {
      this.currentTab = item.tab;
      this.currentConfig = item.config;
      this.currentForm = this.formControls[item.tab];
      this.updateCurrentForm();
    }
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }

  onUpdate($event: any) {
    const storageData = this.storage.getItem(basePrefix);
    this.storage.setItem(basePrefix, {...storageData, ...{[this.currentTab]: $event}});
  }
}
