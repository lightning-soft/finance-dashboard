import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DynamicComponentConfig } from 'lazy-modules';
import { IWindow } from 'window-manager';

export enum WM_NODES {
  CHART = 'Chart',
  WATCHLIST = 'Watchlist',
  ORDERS = 'Orders',
  POSITIONS = 'Positions',
}
@Component({
  selector: 'window-header',
  templateUrl: './window-header.component.html',
  styleUrls: ['./window-header.component.scss'],
})
export class WindowHeaderComponent implements OnInit {

  layoutNode: any;
  window: IWindow;
  title: string;

  @ViewChild('toolbar') toolbar: ElementRef;

  public iconsMap = {
    [WM_NODES.CHART]: 'icon-widget-chart',
    [WM_NODES.WATCHLIST]: 'icon-widget-watchlist',
    [WM_NODES.ORDERS]: 'icon-widget-orders',
    [WM_NODES.POSITIONS]: 'icon-widget-positions',
  };

  constructor(
    private _config: DynamicComponentConfig,
  ) {
    const { data } = this._config;

    this.layoutNode = data.layoutNode;
    this.window = this.layoutNode.layoutContainer;
    this.title = (this.window as any)?.winTitlebar.innerText;
  }

  ngOnInit() {
    this._setToolbar();
  }

  protected _setToolbar() {
    if (this.layoutNode.getToolbarComponent) {
      this.layoutNode.getToolbarComponent().then(domElement => {
        this.toolbar.nativeElement.appendChild(domElement);
      });
    }
  }
}
