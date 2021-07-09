import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ILayoutNode, LayoutNode } from 'layout';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Components } from 'src/app/modules';
import { IChart } from '../models';
import {
  CompositeProfile,
  DefaultIndicator,
  Footprint,
  PriceStats,
  SessionStats,
  VolumeBreakdown,
  VolumeProfile
} from './indicators';
import { Indicator } from './indicators/Indicator';

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
  selectedIndicator: any;
  form: FormGroup;
  formValueChangesSubscription: Subscription;

  private _constructorsMap = new WeakMap<any, new(...args: any[]) => Indicator>([
    [StockChartX.Footprint, Footprint],
    [StockChartX.VolumeProfile, VolumeProfile],
    [StockChartX.CompositeProfile, CompositeProfile],
    [StockChartX.PriceStats, PriceStats],
    [StockChartX.SessionStats, SessionStats],
    [StockChartX.VolumeBreakdown, VolumeBreakdown],
  ]);

  ngOnInit(): void {
    this.setTabTitle('Indicators');
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

  addIndicator() {
    this.layout.addComponent({
      component: {
        name: Components.IndicatorList,
        state: {
          link: this.link,
          chart: this.chart,
        }
      },
      resizable: false,
      width: 522,
      height: 570,
      single: true,
      allowPopup: false,
      removeIfExists: true,
      closableIfPopup: true,
      minimizable: false,
      maximizable: false,
    });
  }

  private _handleChart(chart: IChart) {
    if (!chart) {
      return;
    }

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
}
