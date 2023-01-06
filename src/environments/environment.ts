export const environment = {
  production: false,
  config: 'config/config.json',
  scxPath: './assets/StockChartX/scripts/develop/',
  isDev: true,
  timezone: '/timezone',
  instrument:{
    id: 'ESH3.CME',
    description: 'E-Mini S&P 500 Mar23',
    exchange: 'CME',
    tickSize: 0.25,
    precision: 2,
    instrumentTimePeriod: 'Mar23',
    contractSize: 50,
    productCode: 'ES',
    symbol: 'ESH3',
    company:''
  }
};
