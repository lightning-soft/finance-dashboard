const urlSearchParams = new URLSearchParams(window.location.search);

export const environment = {
  production: true,
  config: 'config/config.release.json',
  scxPath: './assets/StockChartX/scripts/production/',
  application:
  {
    name: 'angular-starter',
    angular: 'Angular 10.0.5',
    bootstrap: 'Bootstrap 4.5.0',
    fontawesome: 'Font Awesome 5.14.0',
  },
  isDev: urlSearchParams.get('dev') === 'false',
  timezone: 'https://worldtimeapi.org/api/timezone'
};
