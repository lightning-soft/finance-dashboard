import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { WindowManager } from 'simple-window-manager';
import { EVENTS, Position } from './enums';
import { IWindow, IWindowManager } from './interfaces';
import { Bounds, Options, saveData } from './types';
import { ILayoutNode } from "layout";

const Shift = 30;
const StartShiftY = 36;
const StartShiftX = Shift;


export type Coords = {
  x: number,
  y: number
};

@Injectable()
export class WindowManagerService {
  private wm: IWindowManager;
  private bounds: Bounds;
  public windows: BehaviorSubject<IWindow[]> = new BehaviorSubject([]);

  get activeWindow() {
    return this.wm.activeWindow;
  }

  get container(): HTMLElement {
    return this.wm.container;
  }

  public createWindow(options: Options): IWindow {
    const { x, y } = this.calculatePosition(options);

    options.x = x;
    options.y = y;

    const win = this.wm.createWindow(options);

    win.type = options.type;

    this.updateWindows();

    win.on(EVENTS.CLOSE, () => this.windows.next(this.wm.windows));

    return win;
  }

  public createWindowManager(container): void {
    if (this.wm) {
      console.warn('Window manager already exist');
      return;
    }

    this.wm = new WindowManager({
      parent: container.nativeElement,
      snapOffset: 12,
      snapIgnoreOffset: 12,
    });

    /**
     * TMP for debag
     */
    (window as any).wm = this.wm;
  }

  public load(config) {
    this.wm.load(config);
    this.updateWindows();
  }

  public saveState(): saveData[] {
    return this.wm.save();
  }

  public closeAll(): void {
    if (!this.wm)
      return;

    while (this.wm.windows.length)
      this.wm.windows[0].close();

    this.updateWindows();
  }

  updateWindows() {
    this.windows.next(this.wm.windows);
  }

  public hideAll() {
    this.wm.windows.forEach((win) => {
      win.visible = false;
    });
    this.updateWindows();
  }

  public updateGlobalOffset(): void {
    this.wm.updateGlobalOffset();
  }

  public getWindowByComponent(component: ILayoutNode): IWindow {
    return this.windows.value.find(i => i.component === component);
  }

  setBounds(bounds: Bounds): void {
    this.bounds = bounds;
    this.wm.setCustomBounds(bounds);
  }

  private calculatePosition(options: Options): Coords {
    const width = options.width || options.minWidth;
    const height = options.height || options.minHeight;

    const containerWidth = this.wm.container.clientWidth;
    const containerHeight = this.wm.container.clientHeight;

    let x = options.x;
    let y = options.y;

    if (typeof x === 'string') {
      switch (x) {
        case Position.LEFT:
          x = 0;
          break;
        case Position.RIGHT:
          x = containerWidth - width;
          break;
        case Position.CENTER:
          x = (containerWidth / 2) - (width / 2);
          break;

        default:
          x = null;
          break;
      }
    }

    if (typeof y === 'string') {
      switch (y) {
        case Position.TOP:
          y = 0;
          break;
        case Position.BOTTOM:
          y = containerHeight - height;
          break;
        case Position.CENTER:
          y = (containerHeight / 2) - (height / 2);
          break;

        default:
          y = null;
          break;
      }
    }

    if (x == null && y == null) {
      ({ x, y } = this.calculateShift({ width, height, containerWidth, containerHeight }));
    }

    return { x: x as number, y: y as number };
  }

  private calculateShift({ width, height, containerWidth, containerHeight }): Coords {
    let result: Coords;

    const shiftedPosition: Coords = this._normalizeCordsConsideringBounds({ x: StartShiftX, y: StartShiftY });

    do {
      const windowWithSameCords = this.wm.windows.find(w => w.x === shiftedPosition.x && w.y === shiftedPosition.y);
      if (windowWithSameCords) {
        shiftedPosition.x += Shift;
        shiftedPosition.y += Shift;

      } else if (shiftedPosition.y + height > containerHeight && height < containerHeight) {
        shiftedPosition.x += Shift;
        shiftedPosition.y += Shift;

      } else if (shiftedPosition.x + width > containerWidth && width < containerWidth) {
        result = { x: 50, y: 50 };
      } else {
        result = shiftedPosition;
      }
    } while (!result);

    return result;
  }

  private _normalizeCordsConsideringBounds(coords: Coords): Coords {
    coords = { ...coords };

    if (!this.bounds)
      return coords;

    if (this.bounds.top > coords.y)
      coords.y = this.bounds.top;

    if (this.bounds.left > coords.x)
      coords.x = this.bounds.left;

    return coords;
  }
}
