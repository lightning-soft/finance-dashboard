import { Component } from '@angular/core';
import { ILayoutNode, LayoutNode } from 'layout';
import { UntilDestroy } from '@ngneat/until-destroy';
import * as clone from 'lodash.clonedeep';
import { defaultSettings, fields } from './field.config';
import { BaseSettingsComponent } from 'base-components';

export const positionsSettings = 'positions-settings';

export interface PositionsSettingsComponent extends ILayoutNode {
}

@Component({
  selector: 'lib-positions-settings',
  templateUrl: './positions-settings.component.html',
  styleUrls: ['./positions-settings.component.scss']
})
@LayoutNode()
@UntilDestroy()
export class PositionsSettingsComponent extends BaseSettingsComponent {
  defaultSettings = defaultSettings;
  fields = clone(fields);

  constructor() {
    super();
    this.setTabTitle('Settings Positions');
    this.setTabIcon('icon-setting-gear');
    this.setIsSettings(true);
  }
}
