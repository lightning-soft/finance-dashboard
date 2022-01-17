import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ArrayHelper, StringHelper } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IChart } from '../models';
import {
  BarStats,
  CompositeProfile,
  CustomVolumeProfile,
  Footprint,
  General,
  Indicator,
  PriceStats,
  SessionStats,
  VolumeBreakdown,
  VolumeProfile,
  VWAP,
  ZigZag,
  ZigZagOscillator
} from './indicators';

declare const StockChartX: any;

const EVENTS_SUFFIX = '.scxComponent';

export interface IndicatorsComponent extends ILayoutNode {
}


@Component({
  selector: 'indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
@LayoutNode()
@UntilDestroy()
export class IndicatorsComponent implements OnInit {
  link: any;
  chart: IChart;

  get indicators(): any[] {
    return (this.chart?.indicators ?? []).filter(i => i.className !== StockChartX.CustomVolumeProfile.className)?.reverse() || [];
  }

  allExpanded = false;
  registeredIndicators = [];
  searchControl = new FormControl('', Validators.required);
  groups: any = [
    {
      name: 'Tradrr',
      indicators: [
        'Footprint',
        'VolumeProfile',
        'CompositeProfile',
        'PriceStats',
        'SessionStats',
        'VolumeBreakdown',
        'ZigZag',
        'ZigZagOscillator',
        'VWAP',
        'BarStats',
      ],
      expanded: true,
    },
    {
      name: 'General', indicators: [
        'MedianPrice',
        'VOL',
        'HML',
        'ROC',
        'VROC',
        'StdDev',
        'WeightedClose',
        'TypicalPrice',
        'SUM',
        'MAX',
        'MIN',
      ],
    },
    {
      name: 'Bands', indicators: [
        'Bollinger',
        'HighLowBands',
        'DBox',
        'Ichimoku',
        'PNB',
        'KeltnerChannel',
      ],
    },
    {
      name: 'Index', indicators: [
        'ADL', 'ADX', 'ASI',
        'SwingIndex', 'MarketFacilitationIndex', 'RAVI',
        'ChaikinMoneyFlow', 'CCI', 'MFI', 'RSI', 'CRS', 'NVI', 'EFI',
        'OBV', /*'SwingIndex',*/ 'ElderThermometer', 'PerformanceIndex', 'TVI',
        'TSI',
        'GRI', 'PVI', /*'PVI',*/ 'TMF', 'HistoricalVolatility', 'PVT',
        'IMI', /*'QStick'*/
      ],
    },
    {
      name: 'Moving Average',
      indicators: [
        'DeviationToMA',
        'MAEnvelopes', 'VMA', 'TMA', 'EMA', 'KAMA', 'HMA', 'VOLMA', 'DEMA', 'TEMA', 'SMA', /*'T3',*/ 'WWS', 'VIDYA', 'WMA', 'ZLEMA'
      ],
    },
    {
      name: 'Oscillator',
      indicators: [
        'AroonOscillator', 'Aroon', 'ATR', 'CenterOfGravity', 'ChaikinVolatility', 'MACD', 'TSF', 'CFO', 'FOSC',
        'ChaikinOscillator', 'CMO', 'CoppockCurve', 'PriceOscillator', 'DM', 'EasyOfMovement', 'EFT', 'ElderRay', 'TrueRange', 'TRIX',
        'Stochastics', 'StochasticsFast', 'UltimateOscillator', 'VolumeOscillator', 'PGO', 'WillamsR', 'PPO', 'WAD', 'PNO'

      ],
    },
    {
      name: 'Regression',
      indicators: [
        'LinearRegressionForecast', 'LinearRegression' /*,'TimeSeriesForecast'*/, 'LinearRegressionIntercept', 'LinearRegressionSlope'
      ],
    },
    {
      name: 'Others',
      indicators: [
        'ADXR', 'APZ', 'BOP', 'DonchianChannel', 'RSS', 'Range', 'KeyReversalDown', 'KeyReversalUp',
        'StochRSI', 'PFE', 'RIND', 'Momentum', 'McGinleysDynamic', 'VolumeUpDown',
        'NBarsDown', 'LogChange', 'NBarsUp'
      ],
    }
  ];
  selectedIndicator: Indicator;
  form: FormGroup;
  formValueChangesSubscription: Subscription;
  indicatorsDescriptions: {
    [key: string]: {
      title: string;
      content: string[];
    }[];
  } = {};
  descriptionEnabled: {
    [key: string]: boolean;
  } = {};

  private _constructorsMap: Map<any, new (...args: any[]) => Indicator>;
  private _forbidAutoScaleIndicators = [];

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.setTabTitle('Indicators');
    this.groups = this.groups.map(item => {
      item.filteredIndicators = item.indicators;
      return item;
    });
    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        untilDestroyed(this)
      ).subscribe((query) => this.search(query));
  }

  isSelected(item: any) {
    return this.selectedIndicator?.instance === item;
  }

  selectIndicator(item: any) {
    const _constructor = this._constructorsMap.get(item.className) || General;

    this.selectedIndicator = new _constructor(item);

    this.formValueChangesSubscription?.unsubscribe();
    this.form = new FormGroup({});
    this.form.valueChanges
      .pipe(
        debounceTime(10),
        untilDestroyed(this))
      .subscribe(() => {
        this.selectedIndicator.applySettings(this.selectedIndicator.settings);
        this.chart.updateIndicators();
        const autoScale = !this._forbidAutoScaleIndicators.includes(this.selectedIndicator.instance.className);
        this.chart.setNeedsLayout();
        this.chart.setNeedsUpdate();
      });
  }

  loadState(state?: any) {
    this.link = state?.link;
    this.chart = state?.chart;

    this._handleChart(this.chart);

    this.addLinkObserver({
      link: this.link,
      layoutContainer: this.layoutContainer,
      handleLinkData: (chart: IChart) => {
        this.chart = chart;
        this._handleChart(this.chart);
      },
    });
  }

  saveState() {
    return {
      link: this.link,
    };
  }

  fetchIndicators() {
    this.registeredIndicators = StockChartX.Indicator.registeredIndicators;
  }

  addIndicator(item) {
    if (this.indicators.find((i) => i._name === item))
      return;

    const _constructor = this.registeredIndicators[item];
    const indicator = new _constructor();
    this.chart.addIndicators(indicator);
    this._applyZIndex();
    this.chart.setNeedsUpdate();
    this.chart.setNeedsLayout();

    this.selectIndicator(indicator);
  }

  private _handleChart(chart: IChart) {
    if (!chart)
      return;

    this._constructorsMap = new Map<any, new (...args: any[]) => Indicator>([
      [StockChartX.Footprint.className, Footprint],
      [StockChartX.VolumeProfile.className, VolumeProfile],
      [StockChartX.CompositeProfile.className, CompositeProfile],
      [StockChartX.PriceStats.className, PriceStats],
      [StockChartX.SessionStats.className, SessionStats],
      [StockChartX.VolumeBreakdown.className, VolumeBreakdown],
      [StockChartX.ZigZag.className, ZigZag],
      [StockChartX.ZigZagOscillator.className, ZigZagOscillator],
      [StockChartX.BarStats.className, BarStats],
      [StockChartX.VWAP.className, VWAP],
      [StockChartX.CustomVolumeProfile.className, CustomVolumeProfile],
    ]);
    this._forbidAutoScaleIndicators = [StockChartX.ZigZagOscillator.className];

    this.fetchIndicators();
  }

  removeIndicator(item: any) {
    const { chart } = this;
    if (this.selectedIndicator?.instance === item)
      this.selectedIndicator = null;

    this._applyZIndex();
    chart.removeIndicators(item);
    chart.setNeedsUpdate();
  }

  toggleVisible(item) {
    item.visible = !item.visible;
    const { chart } = this;
    chart.setNeedsUpdate();
    chart.setNeedsLayout();
  }

  removeAll() {
    const { chart } = this;

    this.indicators.forEach((item) => {
      chart.removeIndicators(item);
    });
    chart.setNeedsUpdate();
  }

  expand(group) {
    group.expanded = !group.expanded;
    this.allExpanded = this.groups.every(item => item.expanded);
  }

  search(query: string) {
    const isEmpty = query === '' || query != null;
    this.groups = this.groups.map(item => {
      if (isEmpty)
        item.filteredIndicators = item.indicators.filter(indicator => indicator.toLowerCase().includes(query.toLowerCase()));
      else
        item.filteredIndicators = item.indicators;
      return item;
    });
  }

  fetchDescription(name: string) {
    if (this.indicatorsDescriptions.hasOwnProperty(name)) {
      return;
    }

    const keys = ['overview', 'interpretation', 'parameters'];
    const contentKeys = ['content', 'content1', 'content2'];

    const promises = keys.map(key => {
      const contentPromises = contentKeys.map(contentKey => {
        if (!StockChartX)
          return Promise.reject();
        return StockChartX.Localization.localizeText(
          this.chart,
          `indicator.${ name }.help.${ key }.${ contentKey }`,
          { defaultValue: null },
        );
      });

      return Promise.all(contentPromises).then(content => content.filter(Boolean));
    });

    Promise.all(promises).then(sections => {
      this.indicatorsDescriptions[name] = sections.map((content, i) => ({
        title: StringHelper.capitalize(keys[i]),
        content,
      }));
      this.descriptionEnabled[name] = sections.some(item => item.length);
      this.cd.detectChanges();
    });
  }

  clearQuery() {
    this.searchControl.patchValue('');
  }

  toggleAll() {
    this.groups = this.groups.map(item => ({ ...item, expanded: !this.allExpanded }));
    this.allExpanded = !this.allExpanded;
  }

  dropped({ previousIndex, currentIndex }) {
    const indicators = this.indicators;
    ArrayHelper.shiftItems(indicators, previousIndex, currentIndex);
    this._applyZIndex(indicators);
    this.chart.setNeedsLayout();
    this.chart.setNeedsUpdate();
  }

  private _applyZIndex(indicators = this.indicators) {
    for (let i = 0; i < indicators.length; i++) {
      if (!indicators[i])
        continue;

      indicators[i].zIndex = 1000 - i;
    }
  }
}
