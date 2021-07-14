import { PositionColumn, PositionColumnsArray, PositionItem } from './position.item';
import { DataCell } from 'data-grid';

export const groupStatus = 'positionGroup';

export class GroupedPositionItem extends PositionItem {
  emptyCell: any = new DataCell({ withHoverStatus: false });

  constructor() {
    super();
    this.emptyCell.changeStatus(groupStatus);
    PositionColumnsArray.forEach((item: PositionColumn) => {
      this[item] = this.emptyCell;
    });
    this.instrumentName = new DataCell({ withHoverStatus: false });
    this.instrumentName.changeStatus(groupStatus);
  }
}
