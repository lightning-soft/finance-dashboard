import { ComponentRef } from '@angular/core';
import { ILinkNode, LinkDataObserver } from '../observers';
import { LayoutNodeEvent } from './layout-node.event';

export interface IContainer {
  setTitle(title: string);
  close();
}

export interface IStateProvider<T = any> {
  saveState?(): T;
  loadState?(state: T);
}

export interface ILayoutNode {
  setTabTitle(value: string);
  handleNodeEvent(name: LayoutNodeEvent, event);
  broadcastLinkData(data: any);
}

// tslint:disable-next-line: no-empty-interface
interface _LayoutNode extends ILayoutNode, IStateProvider, ILinkNode {

}

const linkDataObserver = new LinkDataObserver();

// tslint:disable-next-line: class-name
abstract class _LayoutNode implements IStateProvider<any>, ILayoutNode {

  private componentRef: ComponentRef<typeof _LayoutNode>;

  private _tabTitle: string = null;

  private _layoutContainer: IContainer;

  link: number;

  setLayoutContainer(value) {
    this._layoutContainer = value;
    this._subscribeContainerLayoutEvents(value);
    this._initContainerLayoutEvents(value);
    linkDataObserver.subscribe(this);
  }

  broadcastLinkData(data: any) {
    linkDataObserver.emitLinkData({
      creator: this,
      data,
      link: this.link,
    });
  }

  handleDestroy() {
    if (this.componentRef)
      this.componentRef.destroy();

    linkDataObserver.unsubscribe(this);
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
        // this._layoutContainer.setState({
        //   link: this.link || 0,
        //   component: this.saveState ? this.saveState() : {},
        // });
        break;
    }

    if (this.handleNodeEvent)
      this.handleNodeEvent(name, event);
  }

  private _subscribeContainerLayoutEvents(container) {
    container.on('__all', (name, event) => this._handleLayoutNodeEvent(name, event));
  }

  private _initContainerLayoutEvents(container) {
    if (this._tabTitle)
      container.setTitle(this._tabTitle);
  }

  setTabTitle(value: string) {
    if (this._tabTitle === value)
      return;

    this._tabTitle = value;
    if (this._layoutContainer)
      this._layoutContainer.setTitle(value);
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
