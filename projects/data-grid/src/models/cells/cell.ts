const textBoldClass = ' text-bold';


enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface ICellSettings {
  backgroundColor?: string;
  color?: string;
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

export enum CellStatus {
  Highlight = 'highlight',
  None = '',
}

export abstract class Cell implements ICell {
  name: string = '';
  value = '';
  class = '';
  colSpan = 0;
  _bold: boolean;
  settings = {};
  drawed = false; // performance solution
  status: string = '';
  private _prevStatus = '';

  private _visibility = true;

  get visible() {
    return this._visibility;
  }

  set visible(value) {
    if (!value)
      this.value = '';
    this.drawed = false;
    this._visibility = value;
  }

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

  changeStatus(status: string) {
    if (status == this.status)
      return;

    this._prevStatus = this.status;
    this.status = status;
  }

  revertStatus() {
    this.status = this._prevStatus;
  }

  dehightlight() {
    if (this.status == CellStatus.Highlight)
      this.revertStatus();
  }

  hightlight() {
    this.changeStatus(CellStatus.Highlight);
  }

  clear() {
    this.value = '';
    this.drawed = false;
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


