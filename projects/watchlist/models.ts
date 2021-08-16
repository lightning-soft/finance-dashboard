import { Column } from "data-grid";
import { IBaseTemplate } from "templates";

export interface IWatchListState {
    componentName: string;
    items?: string[];
    columns: Column[];
}
  
export type IWatchListPresets = IBaseTemplate<IWatchListState>;