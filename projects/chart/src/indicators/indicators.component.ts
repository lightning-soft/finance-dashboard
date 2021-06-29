import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILayoutNode, LayoutNode } from 'layout';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IChart } from '../models';
import { DefaultIndicator, Footprint, VolumeBreakdown, VolumeProfile } from './indicators';
import { Components } from 'src/app/modules';
import { debounceTime } from 'rxjs/operators';
import { vwapStats } from "./fields";

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
  selectedIndicator: any = {config: vwapStats, settings: {}};
  form: FormGroup;
  formValueChangesSubscription: Subscription;
  chartIndicators;
  registeredIndicators;


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

    chart.indicators.forEach(indicator => {
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
    this.indicators.push(this._createIndicator(instance));
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

  private _createIndicator(instance: any): any {
    switch (instance.constructor) {
      case StockChartX.Footprint:
        return new Footprint(instance);
      case StockChartX.VolumeProfile:
        return new VolumeProfile(instance);
      case StockChartX.VolumeBreakdown:
        return new VolumeBreakdown(instance);
      default:
        return new DefaultIndicator(instance);
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
