import { NumberCell } from 'data-grid';

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
}
