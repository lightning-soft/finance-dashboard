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

export function roundToTickSize(price: number, tickSize: number, strategy: 'ceil' | 'round' | 'floor' = 'ceil') {
  const multiplier = 1 / tickSize;
  switch (strategy) {
    case 'ceil':
      return Math.ceil(price * multiplier) / multiplier;
    case 'round':
      return Math.ceil(price * multiplier) / multiplier;
    case 'floor':
      return Math.ceil(price * multiplier) / multiplier;
    default:
      throw new Error('Invalid strategy to round price');
  }
}

