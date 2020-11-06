import { EventEmitter, Injectable } from '@angular/core';
import { IMessage } from './interfaces';
import { EventType, Executor} from './types';

@Injectable()
export class GlobalHandlerService {

  private _popupMessageEvent: EventEmitter<IMessage> = new EventEmitter();

  private _handlers: Map<EventType, Executor[]> = new Map();

  private POPUP_HANDLER_NAME = '_popupEmmiter';

  constructor() {
    this._injectPopupEmmiter();
  }

  public on(eventType: EventType, executor: Executor): void {

    this._handlers.has(eventType)
      ? this._handlers.set(eventType, [...this._handlers.get(eventType), executor])
      : this._handlers.set(eventType, [executor]);
  }

  public emit(msg: IMessage) {
    this._sendMessageToPopups(msg);
  }

  private _sendMessageToPopups(msg: IMessage): void {
    // const openPopouts = (window as any).goldenLayout.openPopouts;

    // openPopouts.forEach(openPopout => {
    //   openPopout._popoutWindow[this.POPUP_HANDLER_NAME](msg);
    // });
  }

  private _handlePopupEvent(msg: IMessage) {
    const { eventType } = msg;

    if (!this._handlers.has(eventType)) throw new Error('Event not found!');

    const executors: Executor[] = this._handlers.get(eventType);
    executors.forEach(executor => executor(msg));
  }

  private _injectPopupEmmiter(): void {
    (window as any)[this.POPUP_HANDLER_NAME] = (msg: IMessage) => {
      this._popupMessageEvent.emit(msg);
    };

    this._popupMessageEvent
      .subscribe((msg: IMessage) => this._handlePopupEvent(msg));
  }

}
