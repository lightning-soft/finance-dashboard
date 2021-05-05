import { IBaseItem } from 'communication';

export interface IInstrument extends IBaseItem {
  symbol: string;
  description?: string;
  exchange: string;
  tickSize: number;
  contractSize?: number;
  increment?: number; // get one only
  precision?: number; // get one only
}

export const compareInstruments = (a: IInstrument, b: IInstrument) => {
  return a?.symbol === b?.symbol
    && a?.exchange === b?.exchange;
};
