import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WindowManager } from 'simple-window-manager';
import { EVENTS, Position } from './enums';
import { IWindow, IWindowManager } from './interfaces';
import { Options, saveData } from './types';

const Shift = 30;

type Cords = {
  x: number,
  y: number
};

@Injectable()
export class WindowManagerService {
  private wm: IWindowManager;

  get activeWindow() {
    return this.wm.activeWindow;
  }

  public windows: BehaviorSubject<IWindow[]> = new BehaviorSubject([]);

  get container(): HTMLElement {
    return this.wm.container;
  }

  constructor() { }

  public createWindow(options: Options): IWindow {
    const { x, y } = this.calculatePosition(options);

    options.x = x;
    options.y = y;

    const win = this.wm.createWindow(options);

    win.type = options.type;

    this.windows.next(this.wm.windows);

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
    });

    /**
     * TMP for debag
     */
    (window as any).wm = this.wm;
  }

  public saveState(): saveData {
    return this.wm.save();
  }

  public closeAll(): void {
    if (!this.wm)
      return;

    while (this.wm.windows.length)
      this.wm.windows[0].close();

    this.windows.next(this.wm.windows);

  }

  private calculatePosition(options: Options): Cords {
    const width = options.width || parseInt(options.minWidth, 10);
    const height = options.height || parseInt(options.minHeight, 10);

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

  private calculateShift({ width, height, containerWidth, containerHeight }): Cords {
    let result: Cords;

    let startX = 1;

    const positionMultipliers = { x: startX, y: 1};

    do {
      const x = Shift * positionMultipliers.x;
      const y = Shift * positionMultipliers.y;

      if (this.wm.windows.find(w => w.x === x && w.y === y)) {
        positionMultipliers.x += 1;
        positionMultipliers.y += 1;

      } else if (y + height > containerHeight && height < containerHeight) {
        positionMultipliers.x = ++startX;
        positionMultipliers.y = 1;

      } else if (x + width > containerWidth && width < containerWidth) {
        result = { x: 50, y: 50 };
      } else {
        result = { x, y };
      }
    } while (!result);

    return result;
  }
}
