import { ViewRef } from '@angular/core';
import { ILinkNode, LinkDataObserver } from '../observers';
import { LayoutNodeEvent } from './layout-node.event';
import { Layout } from './layout/layouts/layout';
import { MixinHelper } from '../../../base-components/src/helpers/mixin.helper';
import { IWindow, saveData } from "window-manager";

const { mixinDecorator } = MixinHelper;

export interface IStateProvider<T = any> {
  saveState?(): T;

  loadState?(state: T);
}

export interface ILayoutNode {
  layoutContainer?: IWindow;

  link: number | string;

  layout?: Layout;

  getNavbarTitle?: () => string;

  setIsSettings(value: boolean);

  setTabIcon?(icon: string);

  getTabIcon?(): string;

  getTabTitle?(): string;

  setTabTitle?(value: string);

  getTabState?(): saveData;

  setNavbarTitleGetter?(value: () => string): void;

  handleNodeEvent(name: LayoutNodeEvent, event: any);

  handleLinkData?(data: any);

  broadcastLinkData?(data: any);

  addLinkObserver?(observer: ILinkNode);

  broadcastData?(link: string | number, data: any);

  maximize?();

  minimize?();

  close?();

  closableIfPopup?(): boolean;

  isMaximized?();

  onRemove?(...fn: VoidFunction[]);

  maximizable?();

  minimizable?();

  shouldOpenInNewWindow?();

  setZIndex?(index: number);
}

// tslint:disable-next-line: no-empty-interface
interface _LayoutNode extends ILayoutNode, IStateProvider, ILinkNode<any> {

}

const linkDataObserver = new LinkDataObserver();

// tslint:disable-next-line: class-name
abstract class _LayoutNode implements IStateProvider<any>, ILayoutNode {

  private componentRef: ViewRef;

  private _tabTitle: string;
  private _isSettings = false;

  getNavbarTitle: () => string;

  private _tabIcon: string;

  layoutContainer: IWindow;
  layout: Layout;

  link: number;

  __onRemove: any[];

  onRemove(...fn: VoidFunction[]) {
    if (!Array.isArray(this.__onRemove))
      this.__onRemove = [];

    this.__onRemove.push(...fn);
  }

  addLinkObserver(observer: ILinkNode) {
    linkDataObserver.subscribe(observer);

    this.onRemove(() => linkDataObserver.unsubscribe(observer));
  }

  setLayoutContainer(value) {
    this.layoutContainer = value;
    this.layoutContainer.component = this;
    this._subscribeContainerLayoutEvents(value);
    this._initContainerLayoutEvents(value);
    this.addLinkObserver(this);
  }

  broadcastLinkData(data: any) {
    this.broadcastData(this.link, data);
  }

  broadcastData(link: string | number, data: any) {
    linkDataObserver.emitLinkData({
      creator: this,
      data,
      link,
    });
  }

  handleDestroy() {
    console.log('handleDestroy', this.constructor.name);
    if (this.componentRef) {
      try {
        this.componentRef.destroy();
      } catch (error) {
        console.log(error);
      }
    }

    if (Array.isArray(this.__onRemove)) {
      for (const fn of this.__onRemove) {
        try {
          fn();
        } catch (e) {
          console.error('On remove error', e);
        }
      }
    }
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
    // console.log(name, event, this._layoutContainer);
    switch (name) {
      case LayoutNodeEvent.Destroy:
      case LayoutNodeEvent.Close:
        this.handleDestroy();
        break;
      case LayoutNodeEvent.Hide:
        this.handleHide();
        break;
      case LayoutNodeEvent.Show:
        this.handleShow();
        break;
      case LayoutNodeEvent.MoveStart:
        break;
      case LayoutNodeEvent.MoveEnd:
        break;
      case LayoutNodeEvent.ExtendState:
        // this._layoutContainer.setState({
        //   link: this.link || 0,
        //   component: this.saveState ? this.saveState() : {},
        // });
        break;
    }

    if (this.handleNodeEvent)
      return this.handleNodeEvent(name, event);
  }

  private _subscribeContainerLayoutEvents(container) {
    container.on('__all', (name, event) => this._handleLayoutNodeEvent(name, event));
  }

  private _initContainerLayoutEvents(container) {
    if (this._tabTitle)
      container.setTitle(this._tabTitle);
    if (this._isSettings)
      this.setIsSettings(this._isSettings);
  }

  setTabTitle(value: string) {
    if (this._tabTitle === value)
      return;

    this._tabTitle = value;
    if (this.layoutContainer)
      this.layoutContainer.setTitle(value);
  }
  setIsSettings(value) {
   this._isSettings = value;
   if (this.layoutContainer)
     this.layoutContainer._container.classList.add('settings-container');
  }

  setNavbarTitleGetter(value: () => string) {
    this.getNavbarTitle = value;
  }

  setTabIcon(icon: string) {
    this._tabIcon = icon;
  }

  getTabIcon(): string {
    return this._tabIcon ?? '';
  }

  getTabTitle() {
    return this._tabTitle ?? '';
  }

  get options(): any {
    return this.layoutContainer?.options ?? {};
  }

  isMaximized() {
    return this.layoutContainer.maximized;
  }

  maximizable() {
    return this.layoutContainer?.options?.maximizable;
  }

  minimizable() {
    return this.layoutContainer?.options?.minimizable;
  }

  closableIfPopup() {
    return this.options.closableIfPopup;
  }

  shouldOpenInNewWindow() {
    return this.options.allowPopup;
  }

  close() {
    this.layoutContainer.close();
  }

  minimize() {
    this.layoutContainer.minimize();
  }

  maximize() {
    this.layoutContainer.maximize();
  }

  setZIndex(index: number) {
    this.layoutContainer.z = index;
  }

  getTabState(): saveData {
    return this.layoutContainer.save();
  }

  _removeItself() {
    try {
      if (this.layoutContainer)
        this.layoutContainer.close();
    } catch (e) {
      console.error(e);
    }
  }
}

export function LayoutNode() {
  return mixinDecorator(_LayoutNode);
}
