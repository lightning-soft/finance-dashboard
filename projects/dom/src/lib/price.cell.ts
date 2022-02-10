import { CellStatus, NumberCell } from 'data-grid';

export enum OpenPositionStatus {
  LongPositionOpen = 'longPositionOpen',
  ShortPositionOpen = 'shortPositionOpen',
}

export const openPositionSuffix = 'PositionOpen';

const positionStatuses = [OpenPositionStatus.LongPositionOpen, OpenPositionStatus.ShortPositionOpen] as string[];

export class PriceCell extends NumberCell {

  changeStatus(status: string | OpenPositionStatus) {
    if (positionStatuses.includes(this.status))
      return;

    super.changeStatus(status);
  }

  protected _setHoveredStatus(): void {
    const status = this.status.replace(this._statusPrefix, '');
    if (this._hovered) {
        this._statusPrefix = `${CellStatus.Hovered}${this._statusPrefix ?? ''}`;
      } else {
        this._statusPrefix = (this._statusPrefix ?? '').replace(CellStatus.Hovered, '');
      }
    this.status = this._getStatus(status);
    this.drawed = false;
  }

  dehightlight() {
    if (this.status?.includes(CellStatus.Highlight))
      this.revertStatus();
  }
}
