import { Cell, ICellConfig } from './cell';
import { TextAlign } from 'dynamic-form';

interface ICheckboxCellConfig extends ICellConfig {
  checked?: boolean;
  size?: number;
}

export class CheckboxCell extends Cell {
  public horizontalAlign: TextAlign = TextAlign.Center;
  private readonly rectOffset = 2.2;
  private readonly minWidthFromEdge = 4;
  private x: number;
  private y: number;
  private _checked: boolean;
  private _size: number;
  private _showColumnPanel = true;

  get checked(): boolean {
    return this._checked;
  }

  set showColumnPanel(value: boolean) {
    this._showColumnPanel = value;
  }

  constructor(config?: ICheckboxCellConfig) {
    super(config);
    this._checked = config?.checked ?? false;
    this._size = config?.size ?? 10;
  }

  updateValue(checked: boolean): void {
    this._checked = checked;
  }

  updateClass(className: string): void {
    this.class = className;
  }

  draw(context) {
    const ctx = context?.ctx;

    if (!ctx)
      return;

    this.y = context.y + context.height / 2 - (this._size / 2);
    this._setHorizontalPosition(context);

    ctx.strokeStyle = '#51535A';
    ctx.strokeRect(this.x, this.y, this._size, this._size);

    if (context.y === 0 && this._showColumnPanel) {
      ctx.strokeStyle = '#24262C';
      ctx.strokeRect(context.x, context.y, context.width, context.height);
      ctx.strokeStyle = '#51535A';
    }

    if (this._checked) {
      const size = this._size - 2 * this.rectOffset;
      const rectX = this._getInnerRectPosition(this.x);
      const rectY = this._getInnerRectPosition(this.y);
      const oldFillStyle = ctx.fillStyle;
      ctx.fillStyle = '#0C62F7';
      ctx.fillRect(rectX, rectY, size, size);
      ctx.fillStyle = oldFillStyle;
    }

    return true;
  }

  // return true if checked status changed
  toggleSelect(event: MouseEvent): boolean {
    if (this._isClickedOnCheckbox(event)) {
      this._checked = !this._checked;
      return true;
    }

    return false;
  }

  private _setHorizontalPosition(context): void {
    switch (this.horizontalAlign) {
      case TextAlign.Center:
        this.x = context.x + context.width / 2 - (this._size / 2);
        break;
      case TextAlign.Left:
        this.x = context.x + this.minWidthFromEdge;
        break;
      case TextAlign.Right:
        this.x = context.x + context.width - this._size - this.minWidthFromEdge;
        break;
    }
  }

  private _isClickedOnCheckbox(event: MouseEvent): boolean {
    return this._isBetweenElement(this.x, event.offsetX) && this._isBetweenElement(this.y, event.offsetY);
  }

  private _isBetweenElement(elementPosition: number, clickPosition: number): boolean {
    return elementPosition <= clickPosition && elementPosition + this._size >= clickPosition;
  }

  private _getInnerRectPosition(elemPosition: number): number {
    return elemPosition + this.rectOffset;
  }
}
