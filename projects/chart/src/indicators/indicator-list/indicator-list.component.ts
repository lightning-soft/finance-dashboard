import { Component, Input, OnInit } from '@angular/core';
import { IChart } from 'chart';
import { ILayoutNode, LayoutNode } from 'layout';

declare const StockChartX: any;

export interface IndicatorListComponent extends ILayoutNode {
}

@Component({
  selector: 'indicator-list',
  templateUrl: './indicator-list.component.html',
  styleUrls: ['./indicator-list.component.scss']
})
@LayoutNode()
export class IndicatorListComponent implements OnInit {
  chartIndicators = [];
  registeredIndicators = [];
  chart: IChart;
  link: any;
  showTooltips: boolean;

  ngOnInit() {
    this.setTabTitle('Add Indicators');
  }

  loadState(state?: any) {
    this.link = state?.link;
    this.chart = state?.chart;
    if (this.chart)
      this.fetchIndicators();
    this.addLinkObserver({
      link: this.link,
      handleLinkData: (chart: IChart) => {
        this.chart = chart;
        this.fetchIndicators();
      },
    });
  }

  saveState() {
    return {
      link: this.link,
    };
  }

  fetchIndicators() {
    this.chartIndicators = StockChartX.Indicator.allIndicators();
    this.registeredIndicators = StockChartX.Indicator.registeredIndicators;
  }

  addIndicator(item: any) {
    const indicator = this.registeredIndicators[item];
    this.chart.addIndicators(new indicator);
  }

  getTitle(item: any) {
    return item;
  }
}
