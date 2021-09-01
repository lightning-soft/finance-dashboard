import { IBaseTemplate } from 'templates';

export interface IPositionsState {
    componentInstanceId: number;
    settings: any;
    columns: any;
    contextMenuState: {
        showColumnHeaders: boolean;
        showHeaderPanel: boolean;
    };
}
  
export type IPositionsPresets = IBaseTemplate<IPositionsState>;