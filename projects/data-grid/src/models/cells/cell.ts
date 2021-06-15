const textBoldClass = ' text-bold';

export type CellStatusGetter = (cell: Cell, style: 'BackgroundColor' | 'Color') => string;

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
  hoverStatusEnabled: boolean;

  updateValue(...args: any[]);

  clear();
}

export interface ICellConfig {
  settings?: ICellSettings;
  withHoverStatus?: boolean;
}

export enum CellStatus {
  Highlight = 'highlight',
  Selected = 'selected',
  Hovered = 'hovered',
  None = '',
}

export abstract class Cell implements ICell {
  static mergeStatuses(prefix: string = '', status: string = '') {
    return `${prefix}${status}`;
  }

  protected _statses: string[];
  protected _statusPrefix: string;

  name: string = '';
  value = '';
  class = '';
  colSpan = 0;
  editable = false;
  editType: string;
  editValueSetter: Function;
  _bold: boolean;
  settings: ICellSettings = {};
  drawed = false; // performance solution
  status: string = '';
  hoverStatusEnabled: boolean;
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
    if (!this.hoverStatusEnabled) {
      return;
    }

    if (hovered === (this.status === CellStatus.Hovered))
      return;

    if (hovered)
      this.changeStatus(CellStatus.Hovered);
    else
      this.revertStatus();
  }

  get hovered(): boolean {
    return this.status === CellStatus.Hovered;
  }

  constructor(config?: ICellConfig) {
    this.settings = config?.settings ?? {};
    this.hoverStatusEnabled = config?.withHoverStatus ?? false;
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

    if (this.status === CellStatus.Hovered) {
      this._prevStatus = status;
      return;
    }

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


