import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WindowManager } from 'simple-window-manager';
import { EVENTS } from './enums';
import { IWindow, IWindowManager } from './interfaces';
import { Options, saveData } from './types';

@Injectable()
export class WindowManagerService {
  private wm: IWindowManager;

  public windows: BehaviorSubject<IWindow[]> = new BehaviorSubject([]);

  get container(): HTMLElement {
    return this.wm.container;
  }

  constructor() { }

  public createWindow(options: Options): IWindow {
    const win = this.wm.createWindow(options);

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
  }

  public saveState(): saveData {
    return this.wm.save();
  }
}
