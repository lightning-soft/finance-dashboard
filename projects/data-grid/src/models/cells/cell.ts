const textBoldClass = ' text-bold';

export interface ICell {
  component?: string;
  value: string;
  class?: string;
  colSpan?: number;

  updateValue(...args: any[]);

  clear();
}

export abstract class Cell implements ICell {
  name: string = '';
  value = '';
  class = '';
  colSpan = 0;
  _bold: boolean;


  set bold(value: boolean) {
    if (this._bold === value) {
      return;
    }
    this._bold = value;

    if (value) {
      this.class += textBoldClass;
    } else if (this.class.includes(textBoldClass)) {
      this.class.replace(textBoldClass, '');
    }
  }

  abstract updateValue(...args: any[]);

  clear() {
    this.value = '';
  }
}

export class ReadonlyCell implements ICell {
  value = '';

  constructor(value?: string) {
    this.value = value || '';
  }

  updateValue(...args: any[]) {

  }

  clear() {
  }
}


