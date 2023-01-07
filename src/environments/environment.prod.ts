const urlSearchParams = new URLSearchParams(window.location.search);

export const environment = {
  production: true,
  config: 'config/config.prod.json',
  // scxPath: './assets/StockChartX/scripts/production/',
  scxPath: './assets/StockChartX/scripts/develop/',
  application:
  {
    name: 'angular-starter',
    angular: 'Angular 10.0.5',
    bootstrap: 'Bootstrap 4.5.0',
    fontawesome: 'Font Awesome 5.14.0',
  },
  isDev: urlSearchParams.get('dev') === 'true',
  timezone: 'https://worldtimeapi.org/api/timezone',
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
