import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ArrayHelper, StringHelper } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IChart } from '../models';
import {
  CompositeProfile,
  DefaultIndicator,
  Footprint,
  Indicator,
  PriceStats,
  SessionStats,
  VolumeBreakdown,
  VolumeProfile,
  ZigZag,
  ZigZagOscillator,
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
export class IndicatorsComponent implements OnInit, OnDestroy {
  link: any;
  chart: IChart;
  indicators: any[] = [];
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
        'StochRSI', 'PFE', 'RIND', 'Momentum', 'McGinleysDynamic', 'VWAP', 'VolumeUpDown',
        'NBarsDown', 'LogChange', 'NBarsUp'
      ],
    }
  ];
  selectedIndicator: any;
  form: FormGroup;
  formValueChangesSubscription: Subscription;
  indicatorsDescriptions: {
    [key: string]: {
      title: string;
      content: string[];
    }[];
  } = {};

  private _constructorsMap: WeakMap<any, new(...args: any[]) => Indicator>;

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
    return this.selectedIndicator === item;
  }

  selectIndicator(item: any) {
    this.selectedIndicator = item;

    this.formValueChangesSubscription?.unsubscribe();
    this.form = new FormGroup({});
    this.form.valueChanges
      .pipe(
        debounceTime(10),
        untilDestroyed(this))
      .subscribe(() => {
        this.selectedIndicator.applySettings(this.selectedIndicator.settings);
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
    if (this.indicators.find((indicator) => indicator.instance._name === item))
      return;

    const indicator = this.registeredIndicators[item];
    this.chart.addIndicators(new indicator);
    this.chart.setNeedsUpdate();
  }

  private _handleChart(chart: IChart) {
    if (!chart)
      return;

    this._constructorsMap = new WeakMap<any, new(...args: any[]) => Indicator>([
      [StockChartX.Footprint, Footprint],
      [StockChartX.VolumeProfile, VolumeProfile],
      [StockChartX.CompositeProfile, CompositeProfile],
      [StockChartX.PriceStats, PriceStats],
      [StockChartX.SessionStats, SessionStats],
      [StockChartX.VolumeBreakdown, VolumeBreakdown],
      [StockChartX.ZigZag, ZigZag],
      [StockChartX.ZigZagOscillator, ZigZagOscillator],
    ]);

    this.fetchIndicators();
    chart.indicators?.forEach(indicator => {
      this._addIndicator(indicator);
    });
    chart.on(StockChartX.ChartEvent.INDICATOR_ADDED + EVENTS_SUFFIX, this._handleAddIndicator);
    chart.on(StockChartX.ChartEvent.INDICATOR_REMOVED + EVENTS_SUFFIX, this._handleRemoveIndicator);
  }

  removeIndicator(item: any) {
    const { chart } = this;

    chart.removeIndicators(item.instance);
    chart.setNeedsUpdate();
  }

  private _handleAddIndicator = (event: any) => {
    this._addIndicator(event.value);
    this._selectLastIndicator();
  }

  private _selectLastIndicator() {
    const indicators = this.indicators;
    this.selectIndicator(indicators[indicators.length - 1]);
  }

  private _handleRemoveIndicator = (event: any) => {
    this._removeIndicator(event.value);
  }

  private _addIndicator(instance: any) {
    const Constructor = this._constructorsMap.get(instance.constructor) || DefaultIndicator;

    this.indicators.push(new Constructor(instance));
  }

  removeAll() {
    const { chart } = this;

    this.indicators.forEach((item) => {
      chart.removeIndicators(item.instance);
    });
    chart.setNeedsUpdate();
  }

  private _removeIndicator(instance: any) {
    this.indicators = this.indicators.filter(indicator => indicator.instance !== instance);

    if (this.selectedIndicator?.instance === instance) {
      delete this.selectedIndicator;
    }
  }

  ngOnDestroy() {
    const { chart } = this;

    if (chart) {
      chart.off(StockChartX.ChartEvent.INDICATOR_ADDED + EVENTS_SUFFIX, this._handleAddIndicator);
      chart.off(StockChartX.ChartEvent.INDICATOR_REMOVED + EVENTS_SUFFIX, this._handleRemoveIndicator);
    }
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
    ArrayHelper.swapItems(this.indicators, previousIndex, currentIndex);
    ArrayHelper.swapItems(this.chart.indicators, previousIndex, currentIndex);

    this.chart.updateIndicators();
    this.chart.setNeedsUpdate();
  }
}
