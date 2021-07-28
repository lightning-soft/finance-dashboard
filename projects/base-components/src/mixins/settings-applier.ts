import { MixinHelper } from '../helpers';
import * as clone from 'lodash.clonedeep';
import { AfterViewInit, Directive } from '@angular/core';
import { IWindow } from 'window-manager';

export interface ISettingsApplier {
  settings;

  applySettings();

  getOpenSettingsConfig();

  getCloseSettingsConfig();

  openSettings($event?: MouseEvent);

  closeSettings();
}

@Directive()
export abstract class _SettingsApplier implements AfterViewInit, ISettingsApplier {
  settings: any;
  defaultSettings;
  layout: any;
  layoutContainer;

  loadState(state) {
    this.settings = state?.settings ?? clone(this.defaultSettings);

    this.addLinkObserver({
      link: this._getSettingsKey(),
      layoutContainer: this.layoutContainer,
      handleLinkData: (res) => this._linkSettings(res),
    });
  }

  ngAfterViewInit() {
    if (this.settings)
      this.applySettings();
  }

  openSettings($event) {
    const { name, ...options } = this.getOpenSettingsConfig();
    const widget = this.layout.findComponent((item: IWindow) => {
      return item.visible && item?.options.componentState()?.state?.linkKey === this._getSettingsKey();
    });
    if (widget)
      widget.focus();
    else {
      const coords: any = {};
      if ($event) {
        coords.x = $event.clientX;
        coords.y =  $event.clientY;
      }
      this.layout.addComponent({
        component: {
          name,
          state: { linkKey: this._getSettingsKey(), settings: this.settings }
        },
        closeBtn: true,
        single: false,
        width: 558,
        height: 475,
        allowPopup: false,
        closableIfPopup: true,
        resizable: false,
        removeIfExists: false,
        minimizable: false,
        maximizable: false,
        ...coords,
        ...options,
      });
    }
  }

  closeSettings() {
    const key = this._getSettingsKey();
    const { type } = this.getCloseSettingsConfig();
    this.layout.removeComponents((item) => {
      const isSettingsComponent = type === item.type;
      return item.visible && isSettingsComponent && (item.options.componentState()?.state?.linkKey === key);
    });
  }

  _linkSettings(res) {
    this.settings = res;
    this.applySettings();
  }

  abstract applySettings();

  abstract getOpenSettingsConfig();

  abstract getCloseSettingsConfig();

  abstract _getSettingsKey(): string;

  abstract addLinkObserver({ link, handleLinkData: Function, layoutContainer });
}

export function SettingsApplier() {
  return MixinHelper.mixinDecorator(_SettingsApplier, ['ngAfterViewInit', 'loadState']);
}
