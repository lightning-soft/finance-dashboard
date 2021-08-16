import { SideOrderFormState } from 'base-order-form';
import { IBaseTemplate } from 'templates';
import { IAccount, IInstrument } from 'trading';

export interface IDomState {
    instrument: IInstrument;
    settings?: any;
    componentInstanceId: number;
    columns: any;
    contextMenuState: any;
    account?: IAccount;
    orderForm: SideOrderFormState;
    link: string | number;
}
 
export type IDomPresets = IBaseTemplate<IDomState>;