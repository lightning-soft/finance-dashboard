import { IBaseItem } from 'communication';

export interface ISettings extends IBaseItem {
  theme: string;
  language: string;
  autosavingEnabled: boolean;
}
