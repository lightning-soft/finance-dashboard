import { AfterViewInit, Component } from '@angular/core';
import { ILayoutNode, LayoutNode } from 'layout';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormGroup } from '@angular/forms';
import { DisplayOrders, OpenIn, settingsField } from './configs';
import * as clone from 'lodash.clonedeep';
import { MarketWatchColumns } from '../market-watch-columns.enum';
import { noneValue } from 'dynamic-form';
import { OrderColumn } from 'base-order-form';
import { OrderDuration, OrderSide, OrderType } from 'trading';
import { mergeDeep } from 'base-components';

export const MarketWatchSettings = 'market-watch-settings';
export const marketWatchReceiveKey = 'marketWatchReceiveKey';

export interface MarketWatchSettingsComponent extends ILayoutNode {
}

@UntilDestroy()
@Component({
  selector: MarketWatchSettings,
  templateUrl: './market-watch-settings.component.html',
  styleUrls: ['./market-watch-settings.component.scss']
})
@LayoutNode()
export class MarketWatchSettingsComponent implements AfterViewInit {
  form: FormGroup = new FormGroup({});
  fields = clone(settingsField);
  settings: MarketWatchSettings;
  private _linkKey: string;
  openIn = OpenIn;

  constructor() {
    this.setTabTitle('Settings MarketWatch');
    this.setTabIcon('icon-setting-gear');
    this.setIsSettings(true);
  }

  ngAfterViewInit(): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.settings = mergeDeep(this.settings, res);
        this.broadcastData(this._linkKey, this.settings);
      });
  }

  saveState() {
    return {
      settings: clone(this.settings),
      linkKey: this._linkKey,
    };
  }

  loadState(state) {
    if (this._linkKey && state?.linkKey !== this._linkKey)
      return;

    this.settings = state?.settings ?? clone(defaultSettings);
    this._linkKey = state?.linkKey;

    this.addLinkObserver({
      link: marketWatchReceiveKey + this._linkKey,
      handleLinkData: (res) => {
        try {
          this.settings = clone(res);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  reset() {
    this.form.reset(clone(defaultSettings));
  }
}

export interface MarketWatchSettings {
  colors: {
    askBackground: string;
    askColor: string;
    bidBackground: string;
    bidColor: string;
    bidQuantityColor: string;
    askQuantityColor: string;
    netChangeDownColor: string;
    netChangeUpColor: string;
    percentChangeDownColor: string;
    percentChangeUpColor: string;
    priceUpdateHighlight: string;
    downTextColor: string;
    positionDownColor: string;
    positionTextColor: string;
    positionUpColor: string;
    upTextColor: string;
    textColor: string;
  };
  columnView: {
    [key: string]: { pair: OrderColumn, enabled: boolean }
  };
  order: {
    side: OrderSide,
    duration: OrderDuration,
    type: OrderType,
  };
  display: {
    boldFont: boolean;
    displayOrders: string;
    highlightType: string;
    openIn: string;
    showOrders: boolean;
    showTabs: boolean;
  };
}

export const defaultSettings = {
  colors: {
    askBackground: 'rgba(201, 59, 59, 1)',
    askColor: 'rgba(208, 208, 210, 1)',
    bidBackground: '#0C62F7',
    bidColor: '#D0D0D2',
    bidQuantityColor: '#0C62F7',
    askQuantityColor: 'rgba(201, 59, 59, 1)',
    positionDownColor: 'rgba(201, 59, 59, 1)',
    priceUpdateHighlight: '#0C62F7',
    positionTextColor: 'rgba(208, 208, 210, 1)',
    positionUpColor: '#0C62F7',
    textColor: 'rgba(208, 208, 210, 1)',
    netChangeDownColor: 'rgba(201, 59, 59, 1)',
    netChangeUpColor: '#0C62F7',
    percentChangeDownColor: 'rgba(201, 59, 59, 1)',
    percentChangeUpColor: '#0C62F7',
  },
  columnView: {
    columns: {
      [MarketWatchColumns.Ask]: { pair: OrderColumn.triggerPrice, enabled: true },
      [MarketWatchColumns.AskQuantity]: { enabled: true, pair: OrderColumn.status },
      [MarketWatchColumns.Bid]: { pair: OrderColumn.price, enabled: true },
      [MarketWatchColumns.BidQuantity]: { pair: OrderColumn.averageFillPrice, enabled: true },
      [MarketWatchColumns.High]: { enabled: true, pair: noneValue },
      [MarketWatchColumns.Last]: { pair: OrderColumn.identifier, enabled: true },
      [MarketWatchColumns.Low]: { enabled: true, pair: noneValue },
      [MarketWatchColumns.NetChange]: { pair: OrderColumn.side, enabled: true },
      [MarketWatchColumns.Position]: { pair: OrderColumn.accountId, enabled: true },
      [MarketWatchColumns.Settle]: { enabled: true, pair: noneValue },
      [MarketWatchColumns.PercentChange]: { pair: OrderColumn.quantity, enabled: true },
      [MarketWatchColumns.Volume]: { enabled: true, pair: OrderColumn.duration },
      [MarketWatchColumns.WorkingBuys]: { pair: OrderColumn.type, enabled: true },
      [MarketWatchColumns.Open]: { pair: noneValue, enabled: true },
      [MarketWatchColumns.WorkingSells]: { enabled: true, pair: OrderColumn.description },
    }
  },
  order: {
    side: OrderSide.Buy,
    duration: OrderDuration.DAY,
    type: OrderType.Limit,
  },
  display: {
    boldFont: false,
    displayOrders: DisplayOrders.All,
    highlightType: 'Color',
    openIn: OpenIn.orderTicker,
    showOrders: true,
    showTabs: true,
  }
};
