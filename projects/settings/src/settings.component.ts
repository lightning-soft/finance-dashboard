import {Component, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {KeyBinding, SettingsKeyboardListener} from 'keyboard';
import {ILayoutNode, LayoutNode, LayoutNodeEvent} from 'layout';
import {Themes, ThemesHandler} from 'themes';
import {HotkeyEvents, SettingsService} from './settings.service';
import {SettingsData} from './types';
import {FormGroup} from '@angular/forms';
import {FieldConfig, FieldType, getCheckboxes, IFieldConfig} from "dynamic-form";
import {Subscription} from "rxjs";

export enum SAVE_DALEY {
  FIVE_MIN = 300000,
  AUTO_SAVE = 'AUTO_SAVE',
  MANUAL_SAVE = 'MANUAL_SAVE',
}

enum TABS {
  GENERAL = 'general',
  HOTKEYS = 'hotkeys',
  SOUNDS = 'sounds'
}

const hotkeyStringRepresentation = {
  [HotkeyEvents.SavePage]: 'Save All Settings',
  // [HotkeyEvents.CenterAllWindows]: 'Center All Windows',
  [HotkeyEvents.OpenOrderTicket]: 'Open Order Ticket',
  [HotkeyEvents.OpenTradingDom]: 'Open Trading DOM',
  [HotkeyEvents.OpenChart]: 'Open New Chart',
  [HotkeyEvents.OpenConnections]: 'Open Connections Window',
  [HotkeyEvents.LockTrading]: 'Lock/Unlock Trading',
};

export const generalFields: IFieldConfig[] = [
  new FieldConfig({
    fieldGroupClassName: '',
    key: 'general',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [
          {label: 'Hide Account Name', key: 'hideAccountName'},
          {label: 'Hide From Left', key: 'hideFromLeft'},
          {label: 'Hide From Right', key: 'hideFromRight'},

        ], label: 'Account Name', additionalFields: [{
          templateOptions: {min: 0, label: 'Account Digits To Hide'},
          key: 'digitsToHide',
          type: FieldType.Number,
        }],
        fieldGroupClassName: 'm-t-0',
        extraConfig: {className: 'field-item', fieldGroupClassName: 'd-flex flex-wrap two-rows-mt-0 p-x-7',},
      }),

    ]
  }),
];


export const SettingsConfig = {
  [TABS.GENERAL]: generalFields
};


export interface SettingsComponent extends ILayoutNode {
}

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
@UntilDestroy()
@LayoutNode()
export class SettingsComponent implements OnInit {

  autoSaveSetting: number | string;
  isKeyboardRecording = false;
  keyboardListener = new SettingsKeyboardListener();
  saveDelayValues = {
    fiveMin: SAVE_DALEY.FIVE_MIN,
    manualSave: SAVE_DALEY.MANUAL_SAVE,
  };

  settings: SettingsData;
  hotkeysEvents = Object.values(HotkeyEvents);
  hotkeys: { name: string, key: string, binding: KeyBinding }[] = [];

  themes = [Themes.Dark, Themes.Light];

  tabs = [TABS.GENERAL, TABS.HOTKEYS, TABS.SOUNDS];

  activeTab: TABS;

  TABS = TABS;
  form: FormGroup;
  formValueChangesSubscription: Subscription;

  selectedConfig: any;
  private settingsConfig = SettingsConfig;


  get currentTheme() {
    return this.settings.theme as Themes;
  }

  set currentTheme(theme: Themes) {
    if (this.currentTheme !== theme)
      this._settingsService.changeTheme(theme);
  }

  constructor(
    public themesHandler: ThemesHandler,
    private _settingsService: SettingsService,
  ) {
    this.setTabTitle('Settings');
    this.setTabIcon('icon-setting-gear');
    this.setIsSettings(true);
  }

  ngOnInit(): void {
    this.setTab(this.TABS.GENERAL);
    this._settingsService.settings
      .pipe(untilDestroyed(this))
      .subscribe(s => {
        this.settings = {...s};
        this.getHotkeys();
        if (s.autoSave && s.autoSaveDelay)
          this.autoSaveSetting = s.autoSaveDelay;
        else if (s.autoSave)
          this.autoSaveSetting = SAVE_DALEY.AUTO_SAVE;
        else
          this.autoSaveSetting = SAVE_DALEY.MANUAL_SAVE;
      });
  }

  getHotkeys() {
    this.hotkeys = this.hotkeysEvents.map((key: string) => {
      const binding = this.settings.hotkeys[key] ? KeyBinding.fromDTO(this.settings.hotkeys[key])
        : new KeyBinding([]);
      return {name: hotkeyStringRepresentation[key], key, binding};
    });
  }

  switchAutoSave(delay: number): void {
    switch (delay) {
      case SAVE_DALEY.FIVE_MIN:
        this._settingsService.setAutoSave(SAVE_DALEY.FIVE_MIN);
        break;

      case SAVE_DALEY.MANUAL_SAVE:
      default:
        this._settingsService.removeAutoSave();
        break;
    }
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    if (name === LayoutNodeEvent.Event) {
      if (this.isKeyboardRecording && data instanceof KeyboardEvent) {
        this.keyboardListener.handle(data);
        return true;
      }
    }
    return false;
  }

  updateHotkey(item: any, key) {
    this.settings.hotkeys[key] = item.toDTO();
    this._settingsService.saveKeyBinding(this.settings.hotkeys);
  }

  clearAll() {
    this.hotkeysEvents.forEach((key) => {
      this.settings.hotkeys[key] = new KeyBinding([]).toDTO();
    });
    this._settingsService.saveKeyBinding(this.settings.hotkeys);
  }

  setTab(item: TABS): TABS{
    if (this.activeTab === item){
      return;
    }
    if (item === this.TABS.GENERAL) {
      this.selectedConfig = this.settingsConfig[item];
    }

    return this.activeTab = item;
  }

  saveSettingsGeneral($event): void {
    const q = {
        general: $event.general
    };
    this._settingsService.save(q);
  }
}
