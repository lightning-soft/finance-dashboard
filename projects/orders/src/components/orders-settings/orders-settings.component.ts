import { AfterViewInit, Component } from '@angular/core';
import { defaultSettings, settingsField } from './configs';
import * as clone from 'lodash.clonedeep';
import { ILayoutNode, LayoutNode } from 'layout';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BaseSettingsComponent } from 'base-components';

export const ordersSettings = 'orders-settings';

export interface OrdersSettingsComponent extends ILayoutNode {
}

@Component({
  selector: ordersSettings,
  templateUrl: './orders-settings.component.html',
  styleUrls: ['./orders-settings.component.scss']
})
@LayoutNode()
@UntilDestroy()
export class OrdersSettingsComponent extends BaseSettingsComponent implements AfterViewInit {
  fields = clone(settingsField);
  defaultSettings = clone(defaultSettings);

  constructor() {
    super();
    this.setTabTitle('Settings Orders');
    this.setTabIcon('icon-setting-gear');
    this.setIsSettings(true);
  }
}
