import { ComponentRef } from '@angular/core';
import { LayoutNodeEvent } from './layout-node.event';

// todo: remove this namespace
// tslint:disable-next-line: no-namespace
declare namespace GoldenLayout {
  interface Container {
    [key: string]: any;
  }
}

export interface IStateProvider<T> {

}
export interface ILayoutNode {
  tabTitle?: string;
  handleNodeEvent(name: LayoutNodeEvent, event);
}

// tslint:disable-next-line: no-empty-interface
interface _LayoutNode extends ILayoutNode {

}

// tslint:disable-next-line: class-name
abstract class _LayoutNode implements IStateProvider<any>, ILayoutNode {

  private componentRef: ComponentRef<typeof _LayoutNode>;

  private _tabTitle: string = null;

  get tabTitle(): string {
    return this._tabTitle;
  }

  set tabTitle(value: string) {
    if (this._tabTitle === value)
      return;

    this._tabTitle = value;
    if (this._layoutContainer)
      this._layoutContainer.setTitle(value);
  }

  private _layoutContainer: GoldenLayout.Container;

  setLayoutContainer(value) {
    this._layoutContainer = value;
    this._subscribeContainerLayoutEvents(value);
    this._initContainerLayoutEvents(value);
  }

  saveState(): any {
    return null;
  }

  loadState(state?: any) {
  }

  handleDestroy() {
    if (this.componentRef)
      this.componentRef.destroy();
  }

  handleHide() {
    // if (this.componentRef)
    //   this.componentRef.changeDetectorRef.detach();
  }

  handleShow() {
    // if (this.componentRef)
    //   this.componentRef.changeDetectorRef.reattach();
  }

  private _handleLayoutNodeEvent(name: LayoutNodeEvent, event) {
    console.log(name, event, this._layoutContainer);
    switch (name) {
      case LayoutNodeEvent.Destroy:
        this.handleDestroy();
        break;
      case LayoutNodeEvent.Hide:
        this.handleHide();
        break;
      case LayoutNodeEvent.Show:
        this.handleShow();
        break;
      case LayoutNodeEvent.ExtendState:
        this._layoutContainer.setState(this.saveState());
        break;
    }

    if (this.handleNodeEvent)
      this.handleNodeEvent(name, event);
  }

  private _subscribeContainerLayoutEvents(container: GoldenLayout.Container) {
    container.on('__all', (name, event) => this._handleLayoutNodeEvent(name, event));
  }

  private _initContainerLayoutEvents(container: GoldenLayout.Container) {
    if (this._tabTitle)
      container.setTitle(this._tabTitle);
  }

  _removeItself() {
    try {
      if (this._layoutContainer)
        this._layoutContainer.close();
    } catch (e) {
      console.error(e);
    }
  }
}

export function LayoutNode(): <T extends { new(...args: any) }>(constructor: T) => void {
  return (derivedCtor: any) => {
    Object.getOwnPropertyNames(_LayoutNode.prototype)
      .forEach(name => {
        if (name !== 'constructor') {
          derivedCtor.prototype[name] = _LayoutNode.prototype[name];
        }
      });
  };
}
