import { Component, OnInit } from '@angular/core';
import { StringHelper } from 'base-components';
import { IChart } from 'chart';
import { ILayoutNode, LayoutNode } from 'layout';

const { capitalize } = StringHelper;

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
  indicatorsDescriptions: {
    [key: string]: {
      title: string;
      content: string[];
    }[];
  } = {};

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
      layoutContainer: this.layoutContainer,
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
    this.close();
  }

  fetchDescription(name: string) {
    if (!this.showTooltips || this.indicatorsDescriptions.hasOwnProperty(name)) {
      return;
    }

    const keys = ['overview', 'interpretation', 'parameters'];
    const contentKeys = ['content', 'content1', 'content2'];

    const promises = keys.map(key => {
      const contentPromises = contentKeys.map(contentKey => {
        return StockChartX.Localization.localizeText(
          this.chart,
          `indicator.${name}.help.${key}.${contentKey}`,
          { defaultValue: null },
        );
      });

      return Promise.all(contentPromises).then(content => content.filter(Boolean));
    });

    Promise.all(promises).then(sections => {
      this.indicatorsDescriptions[name] = sections.map((content, i) => ({
        title: capitalize(keys[i]),
        content,
      }));
    });
  }
}
