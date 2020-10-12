import { IScript, IStyle } from './lazy-loading.service';
// import { environment } from '../../../environments/environment';

const environment = { scxPath: '' };

export const scripts = {

  GoldenLayout: {
    src: `./lib/goldenlayout/goldenlayout.js`
  } as IScript,
  StockChartX: [
    {
      src: `${environment.scxPath}StockChartX.min.js`,
      charset: 'iso-8859-1'
    }, {
      src: `${environment.scxPath}StockChartX.UI.min.js`,
      charset: 'iso-8859-1'
    }, {
      src: `./assets/StockChartX/scripts/StockChartX.External.min.js`
    }
  ] as IScript[],
};


export let styles = {
  StockChartX: [
    {
      href: `./assets/StockChartX/css/StockChartX.min.css`
    },
    {
      href: `./assets/StockChartX/css/StockChartX.UI.min.css`
    },
    {
      href: `./assets/StockChartX/css/StockChartX.External.min.css`
    }
  ] as IStyle[]
};
