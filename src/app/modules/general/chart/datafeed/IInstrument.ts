export interface IStockChartXInstrument {
  symbol: string;
  company: string;
  exchange: string;
  tickSize: number;
  id: number;
  digits?: number;
}
