import { AfterViewInit, Component } from '@angular/core';
import { EVENTS, IWindow, WindowManagerService } from 'window-manager';

export enum WM_NODES {
  CHART = 'Chart',
  WATCHLIST = 'Watchlist',
  ORDERS = 'Orders',
  POSITIONS = 'Positions',
}

@Component({
  selector: 'app-frames-manager',
  templateUrl: './frames-manager.component.html',
  styleUrls: ['./frames-manager.component.scss']
})
export class FramesManagerComponent implements AfterViewInit {

  public [WM_NODES.CHART]: Set<IWindow> = new Set();
  public [WM_NODES.WATCHLIST]: Set<IWindow> = new Set();
  public [WM_NODES.ORDERS]: Set<IWindow> = new Set();
  public [WM_NODES.POSITIONS]: Set<IWindow> = new Set();

  public iconsMap = {
    [WM_NODES.CHART]: 'icon-widget-chart',
    [WM_NODES.WATCHLIST]: 'icon-widget-watchlist',
    [WM_NODES.ORDERS]: 'icon-widget-orders',
    [WM_NODES.POSITIONS]: 'icon-widget-positions',
  };

  constructor(private windowManagerService: WindowManagerService) {
    this.windowManagerService.windows.subscribe(windows => {
      console.log(windows);

      for (const win of windows) {
        this[win.winTitlebar.innerText]?.add(win);
        win.on(EVENTS.CLOSE, () => this[win.winTitlebar.innerText].delete(win));
      }

      console.log(this);
    });
  }

  ngAfterViewInit(): void { }

}
