import { Injectable } from '@angular/core';
import { WindowManager } from 'simple-window-manager';

@Injectable()
export class WindowManagerService {
  private wm: WindowManager;

  get container(): HTMLElement {
    return this.wm.container;
  }

  get windows() {
    return this.wm.windows;
  }

  constructor() {}

  public createWindowManager(container): void {
    if (this.wm) {
      console.warn('Window manager already exist');
      return;
    }

    this.wm = new WindowManager({
      parent: container.nativeElement,
      backgroundWindow: 'grey',
    });

    // // manager.snap({ spacing: 1 });

    // this.dockManager = manager;
    // (window as any).dockManager = manager;
    // (window as any).wm = manager;
  }

  public saveState(): any {
    return this.wm.save();
  }
}
