import { Column } from "./types";

export abstract class HoverableItem {
  private _hoveredProperties = [];

  protected _hovered = false;

  set hovered(value: boolean) {
    if (this._hovered === value)
      return;

    this._hovered = value;
  }

  get hovered(): boolean {
    return this._hovered;
  }

  protected abstract _getPropertiesForHover(column: Column): string[];

  hover(column: any) {
    const hovered = column !== false;
    const properties = !hovered ? this._hoveredProperties : this._getPropertiesForHover(column);

    if (hovered && !properties)
      return;

    if (Array.isArray(properties)) {
      for (const property of properties) {
        if (this[property]) {
          this[property].hovered = hovered;
          this[property].drawed = false;
        }
      }
    }

    this._hoveredProperties = hovered ? properties : null;
  }
}
