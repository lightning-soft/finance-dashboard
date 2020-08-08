import { ComponentRef } from '@angular/core';
import { LayoutNodeEvent } from './layout-node.event';
import { Subject } from 'rxjs';

declare namespace GoldenLayout {
  interface Container {
    [key: string]: any;
  }
}

export interface IStateProvider<T> {

}

export abstract class LayoutNode implements IStateProvider<any> {

  private componentRef: ComponentRef<typeof LayoutNode>;

  private _tabTitle?: string = null;

  get tabTitle(): string {
    return this._tabTitle;
  }

  set tabTitle(value: string) {
    if (this._tabTitle === value)
      return;

    this._tabTitle = value;
    if (this._goldenLayoutContainer)
      this._goldenLayoutContainer.setTitle(value);
  }

  private _goldenLayoutContainer: GoldenLayout.Container;

  get goldenLayoutContainer(): GoldenLayout.Container {
    return this._goldenLayoutContainer;
  }

  set goldenLayoutContainer(value: GoldenLayout.Container) {
    this._goldenLayoutContainer = value;
    this._subscribeGoldenContainerLayoutEvents(value);
    this._initGoldenContainerLayoutEvents(value);
  }

  events = new Subject();

  saveState(): any {
    return null;
  }

  loadState(state?: any) {
  }

  // handlerOpen() {}
  handleResize() {
  }

  handleDestroy() {
    if (this.componentRef)
      this.componentRef.destroy();
  }

  // handleClose() {}
  // handleTab() {}

  handleHide() {
    // if (this.componentRef)
    //   this.componentRef.changeDetectorRef.detach();
  }

  handleShow() {
    // if (this.componentRef)
    //   this.componentRef.changeDetectorRef.reattach();
  }

  // @trigger('openPopup')
  private _openPopup(container: GoldenLayout.Container) {
    if (!container)
      return;

    try {
      container.setState(this.saveState());
      this._removeItself();

      return { content: [(container as any)._config] };
    } catch (e) {
      return null;
    }
  }

  private _subscribeGoldenContainerLayoutEvents(container: GoldenLayout.Container) {
    container.on('popup', () => this._openPopup(container));
    container.on('event', (event) => {
      this._broadcastEvent(event);
    });
    container.on('open', () => {
      this._hideDropdowns();
    });
    container.on(LayoutNodeEvent.Resize, () => {
      this.handleResize();
      this._hideDropdowns();
      this._broadcastEvent(LayoutNodeEvent.Resize);
    });
    container.on('destroy', () => {
      this.handleDestroy();
    });
    container.on('close', () => {
      this._hideDropdowns();
    });
    container.on('tab', () => {
      this._hideDropdowns();
    });
    container.on('hide', () => {
      this.handleHide();
      this._hideDropdowns();
    });
    container.on(LayoutNodeEvent.Show, () => {
      this.handleShow();
      let _loadMoreIfNeed = (this as any)._loadMoreIfNeed;

      if (_loadMoreIfNeed)
        _loadMoreIfNeed();

      this._broadcastEvent(LayoutNodeEvent.Show);
    });
    container.on('extendState', () => {
      container.setState(this.saveState());
    });
  }

  private _broadcastEvent(event) {
    this.events.next(event);
  }

  private _initGoldenContainerLayoutEvents(container: GoldenLayout.Container) {
    container.setTitle(this._tabTitle);
  }

  _removeItself() {
    try {
      if (this._goldenLayoutContainer)
        this._goldenLayoutContainer.close();
    } catch (e) {
      console.error(e);
    }
  }

  // @trigger('hide-dropdown')
  _hideDropdowns() {
  }
}
