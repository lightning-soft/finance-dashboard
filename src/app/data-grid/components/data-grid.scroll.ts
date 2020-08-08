import {ElementRef} from '@angular/core';

export class DataGridScroll {
  private get _element() {
    return this._scroll && this._scroll.nativeElement;
  }

  get scrollHeight(): number {
    return this._element && this._element.scrollHeight;
  }

  get clientHeight(): number {
    return this._element && this._element.clientHeight;
  }

  get scrollTop(): number {
    return this._element && this._element.scrollTop;
  }

  set scrollTop(value: number) {
    if (this._element)
      this._element.scrollTop = value;
  }

  constructor(public _scroll: ElementRef) {

  }
}
