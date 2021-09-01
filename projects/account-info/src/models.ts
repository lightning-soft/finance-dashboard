import { IBaseTemplate } from 'templates';

export interface IAccountInfoState {
    columns?: any;
    contextMenuState?: any;
}
 
export type IAccountInfoPresets = IBaseTemplate<IAccountInfoState>;