import { Component, OnInit } from '@angular/core';
import { FieldConfig, FieldType } from 'dynamic-form';

enum SettingTab {
  General, Hotkeys, Columns, Common,
}

@Component({
  selector: 'dom-settings',
  templateUrl: './dom-settings.component.html',
  styleUrls: ['./dom-settings.component.scss']
})
export class DomSettingsComponent implements OnInit {
  currentTab = SettingTab.General;
  tabs = SettingTab;
  generalFields: FieldConfig[] = [
    {
      type: FieldType.Select,
      label: 'Font',
      options: ['Open Sans'],
      value: 'Open Sans'
    },
    {
      type: FieldType.Select,
      label: 'Font',
      options: ['Regular', 'Bold', 'Bolder'],
      value: 'Regular',
      name: 'fontFamily'
    },
    {
      type: FieldType.Input,
      label: 'Font size',
      value: 12,
      name: 'fontSize',
      inputType: 'number'
    },
    {
      type: FieldType.Checkbox,
      label: 'Columns View',
      name: 'view',
      value: ['Alert', 'Volume Profile'],
      options: ['Alert', 'Ask Delta', 'Bid Profile', 'Bid Delta', 'Ask Profile', 'Volume Profile',
        'Merge Bid/Ask Delta', 'Current Traders at Bid', 'Last Traded Quantity (LTO)', 'Current Traders at Ask', 'Orders']
    }
  ];
  hotkeyFields: FieldConfig[] = [
    {
      type: FieldType.Input,
      label: 'Auto Center',
      inputType: 'text',
      name: 'autoCenter',
    },
    {
      type: FieldType.Input,
      label: 'Auto Center All Windows',
      inputType: 'text',
      name: 'autoCenterWindows',
    },
    {
      type: FieldType.Input,
      label: 'Buy Market',
      inputType: 'text',
      name: 'buyMarket',
    },
    {
      type: FieldType.Input,
      label: 'Sell Market',
      inputType: 'text',
      name: 'sellMarket',
    },
    {
      type: FieldType.Input,
      label: 'Hit Bid',
      inputType: 'text',
      name: 'hitBid',
    },
    {
      type: FieldType.Input,
      label: 'Join Bid',
      inputType: 'text',
      name: 'joinBid',
    },
    {
      type: FieldType.Input,
      label: 'Lift Offer',
      inputType: 'text',
      name: 'liftOffer',
    },
    {
      type: FieldType.Input,
      label: 'OCO',
      inputType: 'text',
      name: 'oco',
    },
    {
      type: FieldType.Input,
      label: 'Flatten',
      inputType: 'text',
      name: 'flatten',
    },
    {
      type: FieldType.Input,
      label: 'Cancel All Orders',
      inputType: 'text',
      name: 'cancelAllOrders',
    },
    {
      type: FieldType.Input,
      label: 'Quantity 1 Preset',
      inputType: 'text',
      name: 'quantity1',
    },
    {
      type: FieldType.Input,
      label: 'Quantity 2 Preset',
      inputType: 'text',
      name: 'quantity2',
    },
    {
      type: FieldType.Input,
      label: 'Quantity 3 Preset',
      inputType: 'text',
      name: 'quantity3',
    },
    {
      type: FieldType.Input,
      label: 'Quantity 4 Preset',
      inputType: 'text',
      name: 'quantity4',
    },
    {
      type: FieldType.Input,
      label: 'Quantity 5 Preset',
      inputType: 'text',
      name: 'quantity5',
    },
    {
      type: FieldType.Input,
      label: 'Quantity to Position Size',
      inputType: 'text',
      name: 'quantityToPos',
    },
    {
      type: FieldType.Input,
      label: 'Set All Stops to Price',
      inputType: 'text',
      name: 'stopsToPrice',
    },
    {
      type: FieldType.Input,
      label: 'Clear Alerts',
      inputType: 'text',
      name: 'clearAlerts',
    },
    {
      type: FieldType.Input,
      label: 'Clear Alerts All Window',
      inputType: 'text',
      name: 'clearAlertsWindow',
    },
    {
      type: FieldType.Input,
      label: 'Clear All Totals',
      inputType: 'text',
      name: 'clearTotals',
    },
    {
      type: FieldType.Input,
      label: 'Clear Current Trades All Windows',
      inputType: 'text',
      name: 'clearCurrentTradesWindows',
    },
    {
      type: FieldType.Input,
      label: 'Clear Current Trades Down',
      inputType: 'text',
      name: 'clearCurrentTradesDown',
    },
    {
      type: FieldType.Input,
      label: 'Clear Current Trades Down All Windows',
      inputType: 'text',
      name: 'clearCurrentTradesDownWindows',
    },
    {
      type: FieldType.Input,
      label: 'Clear Current Trades Up',
      inputType: 'text',
      name: 'clearCurrentTradesUp',
    },
    {
      type: FieldType.Input,
      label: 'Clear Current Trades Up All Windows',
      inputType: 'text',
      name: 'clearCurrentTradesUpWindows',
    },
    {
      type: FieldType.Input,
      label: 'Clear Total Trades Down',
      inputType: 'text',
      name: 'clearTotalTradesDown',
    },
    {
      type: FieldType.Input,
      label: 'Clear Total Trades Down All Windows',
      inputType: 'text',
      name: 'clearTotalTradesDownWindows',
    },
    {
      type: FieldType.Input,
      label: 'Clear Total Trades Up',
      inputType: 'text',
      name: 'clearTotalTradesUp',
    },
    {
      type: FieldType.Input,
      label: 'Clear Total Trades Up All Windows',
      inputType: 'text',
      name: 'clearTotalTradesUpWindows',
    },
    {
      type: FieldType.Input,
      label: 'Clear Volume Profile',
      inputType: 'text',
      name: 'clearVolumeProfile',
    },
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

  openGeneral() {
    this.currentTab = this.tabs.General;
  }

  openHotkeys() {
    this.currentTab = this.tabs.Hotkeys;
  }

  shouldShowForm(tab: SettingTab) {
    return this.currentTab === tab;
  }
}
