import { KeyBinding } from 'keyboard';
import { Workspace } from 'workspace-manager';
import { ITimezone } from 'timezones-clock';
import { NavbarPosition } from "./settings.service";

export interface ICommand {
  readonly UIString: string;
  readonly name: string;
}

export type HotkeyEntire = [ICommand, KeyBinding];

export type SettingsData = {
  theme: string;
  autoSave: boolean;
  autoSaveDelay: number;
  language: string;
  hotkeys: HotkeyEntire[];
  tradingEnabled: boolean;
  workspaces: Workspace[];
  navbarPosition: NavbarPosition;
  isNavbarHidden: boolean;
  timezones: ITimezone[];
};
