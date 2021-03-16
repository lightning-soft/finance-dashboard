import { Cell } from './cell';

export class CheckboxCell extends Cell {
  private readonly rectOffset = 2.2;
  private x: number;
  private y: number;

  get checked(): boolean {
    return this._checked;
  }

  constructor(private _checked = false, private _size: number = 10) {
    super();
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

    this.x = context.x + context.width / 2 - (this._size / 2);
    this.y = context.y + context.height / 2 - (this._size / 2);

    ctx.strokeStyle = '#51535A';
    ctx.strokeRect(this.x, this.y, this._size, this._size);

    if (this._checked) {
      const size = this._size - 2 * this.rectOffset;
      const rectX = this._getInnerRectPosition(this.x);
      const rectY = this._getInnerRectPosition(this.y);
      const oldFillStyle = ctx.fillStyle;
      ctx.fillStyle = '#4895F5';
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
