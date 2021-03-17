import { KeyBinding } from 'keyboard';
import { Workspace, WorkspaceWindow } from 'workspace-manager';
export interface ICommand {
  readonly UIString: string;
  readonly name: string;
}

export enum NavbarPosition {
  Top = 'Top',
  Bottom = 'Bottom',
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
};
