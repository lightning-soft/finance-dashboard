import set = Reflect.set;

const textBoldClass = ' text-bold';
const hoverStatus = 'hover';

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
  withHoverStatus?: boolean;
}

export enum CellStatus {
  Highlight = 'highlight',
  None = '',
}

export abstract class Cell implements ICell {
  static mergeStatuses(prefix: string, status: string) {
    return [prefix, status]
      .filter(Boolean)
      // .map((item, i) => i > 0 ? capitalizeFirstLetter(item) : item)
      .join('');
  }

  protected _statses: string[];
  protected _statusPrefix: string;
  protected _hoverStatusEnabled: boolean;
  protected _hovered: boolean;

  name: string = '';
  value = '';
  class = '';
  colSpan = 0;
  _bold: boolean;
  settings: ICellSettings = {};
  drawed = false; // performance solution
  status: string = '';
  private _prevStatus = '';

  protected _visibility = true;

  get visible() {
    return this._visibility;
  }

  set visible(value) {
    if (this._visibility === value)
      return;

    this.drawed = false;
    this._visibility = value;
    this._visibilityChange();
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

  set hovered(hovered: boolean) {
    if (!this._hoverStatusEnabled || hovered === this._hovered) {
      return;
    }

    this._hovered = hovered;
    this.changeStatus(hovered ? hoverStatus : this._prevStatus, !hovered);
  }

  get hovered(): boolean {
    return this._hovered;
  }

  constructor(config?: ICellConfig) {
    this.settings = config?.settings ?? {};
    this._hoverStatusEnabled = config?.withHoverStatus ?? false;
  }

  abstract updateValue(...args: any[]);

  setStatusPrefix(prefix: string) {
    if (prefix == this._statusPrefix)
      return;

    const status = this.status.replace(this._statusPrefix, '');
    this._statusPrefix = prefix;

    this.changeStatus(status);
    this.drawed = false;
  }

  protected _getStatus(status: string, usePrefix = true) {
    return usePrefix ? Cell.mergeStatuses(this._statusPrefix, status) : status;
  }

  changeStatus(status: string, usePrefix = true): void {
    status = this._getStatus(status, usePrefix);

    if (status == this.status)
      return;

    this._prevStatus = this.status;
    this.status = status;
    this.drawed = false;
  }

  revertStatus() {
    this.status = this._prevStatus;
    this.drawed = false;
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

  protected _visibilityChange() {
    throw new Error('Implement visibility change');
  }

  refresh() {
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


