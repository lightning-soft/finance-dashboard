import { ITimezone } from 'timezones-clock';
import { IKeyBindingDTO } from 'keyboard';
import { Workspace } from 'workspace-manager';
import { NavbarPosition } from "./settings.service";
import { IBaseTemplate } from "templates";
import { ISound } from 'projects/sound/src/lib/sound.interface';

export interface ICommand {
  readonly UIString: string;
  readonly name: string;
}

export type HotkeyEntire = { [key: string]: IKeyBindingDTO };

export type SettingsData = {
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
  sound: boolean;
  connectedSound?: ISound;
  connectionLostSound?: ISound;
  orderFilledSound?: ISound;
  orderCancelledSound?: ISound;
  orderReplacedSound?: ISound;
  orderPendingSound?: ISound;
  orderRejectedSound?: ISound;
  targetFilledSound?: ISound;
  stopFilledSound?: ISound;
  alertSound?: ISound;
};
