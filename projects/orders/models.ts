import { DataGridState } from 'data-grid';
import { IBaseTemplate } from 'templates';

export interface IOrdersState extends DataGridState {
    settings: any;
    componentInstanceId: number;
}
  
export type IOrdersPresets = IBaseTemplate<IOrdersState>;