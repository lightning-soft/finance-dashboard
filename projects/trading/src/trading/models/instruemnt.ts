import { IBaseItem } from '../../common'

export interface IInstrument extends IBaseItem {
    name: string;
    exchange: string;
    tickSize: number;
}
