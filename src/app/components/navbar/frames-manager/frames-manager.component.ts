import { AfterViewInit, Component } from '@angular/core';
import { EVENTS, IWindow, WindowManagerService } from 'window-manager';

export enum WM_NODES {
  CHART = 'Chart',
  WATCHLIST = 'Watchlist',
  ORDERS = 'Orders',
  POSITIONS = 'Positions',
}

export type WindowTuple = [WM_NODES, Set<IWindow>];

@Component({
  selector: 'app-frames-manager',
  templateUrl: './frames-manager.component.html',
  styleUrls: ['./frames-manager.component.scss']
})
export class FramesManagerComponent implements AfterViewInit {

  public windowTuples: WindowTuple[] = [
    [WM_NODES.CHART, new Set()],
    [WM_NODES.WATCHLIST, new Set()],
    [WM_NODES.POSITIONS, new Set()],
    [WM_NODES.ORDERS, new Set()],
  ];

  public iconsMap = {
    [WM_NODES.CHART]: 'icon-widget-chart',
    [WM_NODES.WATCHLIST]: 'icon-widget-watchlist',
    [WM_NODES.ORDERS]: 'icon-widget-orders',
    [WM_NODES.POSITIONS]: 'icon-widget-positions',
  };

  constructor(private windowManagerService: WindowManagerService) {
    this.windowManagerService.windows.subscribe(windows => {
      this.sortWindows(windows);
    });
  }

  ngAfterViewInit(): void { }

  public handleClick(window: IWindow): void {
    window.minimize();
  }

  private sortWindows(windows: IWindow[]): void {
    for (const window of windows) {
      const windowTuple = this.windowTuples.find(item => item[0] === window.winTitlebar.innerText);

      if (windowTuple){
        windowTuple[1].add(window);
        window.on(EVENTS.CLOSE, () => windowTuple[1].delete(window));
      }
    }
  }
}
