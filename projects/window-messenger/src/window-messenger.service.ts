import { Injectable } from '@angular/core';

enum WindowEvents {
  Message = 'message'
}

@Injectable({ providedIn: 'root' })
export class WindowMessengerService {
  private _listeners = {};

  constructor() {
    window.addEventListener(WindowEvents.Message, ({ data }) => {

      if (!data || typeof data !== 'string')
        return;

      try {
        const { type, payload } = JSON.parse(data);
        const listener = this._listeners[type];
        listener?.forEach(fn => fn(payload));
      } catch (e) {
        console.log(e);
      }
    });
  }

  send(type, payload) {
    try {
      const message = JSON.stringify({ type, payload });
      window?.opener.postMessage(message, window.location.origin);
    } catch (err) {
      console.error(err);
    }
  }

  subscribe(type, listener) {
    if (!this._listeners[type]?.length) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
    return () => {
      this._listeners[type] = this._listeners[type].filter(item => item !== listener);
    };
  }
}
