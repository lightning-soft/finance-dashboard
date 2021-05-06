import { Cell } from "data-grid";

export abstract class HoverableItem {
  protected _hovered = false;

  set hovered(value: boolean) {
    this._hovered = value;
    this._getCellsToHover().forEach(cell => cell.hovered = this._hovered);
  }

  get hovered(): boolean {
    return this._hovered;
  }

  protected abstract _getCellsToHover(): Cell[];
}
