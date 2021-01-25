import { KeyBinding } from 'keyboard';
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
};
