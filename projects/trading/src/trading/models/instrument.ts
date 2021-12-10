import { IBaseItem } from 'communication';

export enum InstrumentType {
  Future = 'Future',
  FutureOption = 'FutureOption',
  FutureOptionStrategy = 'FutureOptionStrategy',
  FutureStrategy = 'FutureStrategy',
  Spread = 'Spread'
}

export interface IInstrument extends IBaseItem {
  symbol: string;
  description?: string;
  exchange: string;
  tickSize: number;
  contractSize?: number;
  type?: InstrumentType;
  instrumentTimePeriod?: string;
  stringTypeRepresentation?: string;
  productCode?: string;
  increment?: number; // get one only
  precision?: number; // get one only
  fraction?: number;
}

export const compareInstruments = (a: IInstrument, b: IInstrument) => {
  // return a?.symbol === b?.symbol
  //   && a?.exchange === b?.exchange;

  return a?.id === b?.id;
};

export function roundToTickSize(price: number, tickSize: number, strategy: 'ceil' | 'round' | 'floor' = 'ceil') {
  const multiplier = tickSize === 0 ? 1 : (1 / tickSize);

  switch (strategy) {
    case 'ceil':
      return Math.ceil(price * multiplier) / multiplier;
    case 'round':
      return Math.round(price * multiplier) / multiplier;
    case 'floor':
      return Math.floor(price * multiplier) / multiplier;
    default:
      throw new Error('Invalid strategy to round price');
  }
}

