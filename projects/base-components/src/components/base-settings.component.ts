import { untilDestroyed } from '@ngneat/until-destroy';
import { FieldConfig } from 'dynamic-form';
import * as clone from 'lodash.clonedeep';
import { FormGroup } from '@angular/forms';
import { ILayoutNode } from 'layout';
import { AfterViewInit, Directive } from '@angular/core';

export interface BaseSettingsComponent extends ILayoutNode {
}
@Directive()
export abstract class BaseSettingsComponent implements AfterViewInit {
  fields: FieldConfig[] = [];
  defaultSettings = {};
  form: FormGroup = new FormGroup({});
  settings;
  _linkKey: string;


  ngAfterViewInit(): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.settings = clone(res);
        this.broadcastData(this._linkKey, this.settings);
      });
  }

  saveState() {
    return {
      settings: clone(this.settings),
      linkKey: this._linkKey,
    };
  }

  loadState(state) {
    this.settings = state?.settings ?? clone(this.defaultSettings);
    this._linkKey = state.linkKey;
  }
}
