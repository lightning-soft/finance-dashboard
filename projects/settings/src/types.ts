import { KeyBinding } from 'keyboard';
import { Workspace } from 'workspace-manager';
import { ITimezone } from 'timezones-clock';

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
  timezones: ITimezone[]
};
