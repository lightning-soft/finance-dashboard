import { ITimezone } from 'timezones-clock';
import { IKeyBindingDTO } from 'keyboard';
import { Workspace } from 'workspace-manager';
import { NavbarPosition } from './settings.service';
import { IBaseTemplate } from 'templates';
import { ISound } from 'sound';
import { IVolumeTemplate } from 'chart';

export interface ICommand {
  readonly UIString: string;
  readonly name: string;
}

export type HotkeyEntire = { [key: string]: IKeyBindingDTO };

export type SettingsData = {
  general?: {
    digitsToHide: number;
    hideAccountName: boolean;
    hideFromLeft: boolean;
    hideFromRight: boolean;
  };
  theme: string;
  autoSave: boolean;
  autoSaveDelay: number;
  language: string;
  hotkeys: HotkeyEntire;
  tradingEnabled: boolean;
  workspaces: Workspace[];
  navbarPosition: NavbarPosition;
  isNavbarHidden: boolean;
  timezones: ITimezone[];
  localTimezoneTitle: string;
  templates: IBaseTemplate[];
  sound: {
    connected: ISound;
    connectionLost: ISound;
    orderFilled: ISound;
    orderCancelled: ISound;
    orderReplaced: ISound;
    orderPending: ISound;
    orderRejected: ISound;
    targetFilled: ISound;
    stopFilled: ISound;
    alert: ISound;
    isPlay: boolean;
  };
  volumeProfileTemplates?: IVolumeTemplate[],
};
