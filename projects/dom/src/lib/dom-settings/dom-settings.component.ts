import { AfterViewInit, Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { debounceTime, skip } from "rxjs/operators";
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
export class DomSettingsComponent implements AfterViewInit, OnInit, OnDestroy {
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

  constructor(private storage: DomSettingsStore) {
    this.setTabTitle('Dom settings');
  }

  ngOnInit() {

    /**
     * Think about refactor!
     */
    const formControls = this.list
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
    this.currentConfig = this.list[0].config;
    this.form = new FormGroup(formControls);
  }

  ngAfterViewInit(): void {
      this.generateForm();
    //  this.updateCurrentForm();
  }

  async generateForm() {
    const data = await this.storage.getSettings().toPromise();
    if (data) {
      for (let controlKey in this.form.controls) {
        console.warn(controlKey);
        console.warn(data[controlKey]);
        for (let dataKey in data[controlKey]) {
          (this.form.controls[controlKey] as FormGroup).addControl(dataKey, new FormControl(data[controlKey][dataKey]));
          console.warn(this.form.controls[controlKey].controls[dataKey].value);
        }
      }
      // this.form.setValue(data);
      console.warn(this.form);
      console.warn(data);

    }
  }

  open(item) {
    if (this.currentTab !== item.tab) {
      this.currentTab = item.tab;
      this.currentConfig = item.config;
      // this.updateCurrentForm();
    }
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }


  ngOnDestroy(): void {
  }

  dispose() {
    this.storage.setSettings(this.form.value)
      .toPromise();
  }

  getForm(currentTab: SettingTab) {
    return this.form.get(currentTab) as FormGroup;
  }
}
