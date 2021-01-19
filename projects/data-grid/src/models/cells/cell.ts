const textBoldClass = ' text-bold';


enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface ICellSettings {
  backgroundColor?: string;
  fontColor?: string;
  textAlign?: TextAlign;
  highlightBackgroundColor?: string;
  fontSize?: number;
}

export interface ICell {
  component?: string;
  value: string;
  class?: string;
  colSpan?: number;
  settings?: ICellSettings;

  updateValue(...args: any[]);

  clear();
}

export interface ICellConfig {
  settings?: ICellSettings;
}

export abstract class Cell implements ICell {
  name: string = '';
  value = '';
  class = '';
  colSpan = 0;
  _bold: boolean;
  settings = {};

  constructor(config?: ICellConfig) {
    this.settings = config?.settings ?? {};
  }

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

  toString() {
    return this.value;
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


