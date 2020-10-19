// import {DataGridHandler, IDataGridHandlerConfig} from './data-grid.handler';

// export interface CellClickDataGridHandlerConfig<T> extends IDataGridHandlerConfig<T> {
//   column: string;
// }

// export class CellClickDataGridHandler<T> extends DataGridHandler<T> {
//   tableHandler;

//   constructor(config: CellClickDataGridHandlerConfig<T>) {
//     super(config);
//     // this.tableHandler = new CellClickHandler({
//     //   column: config.column,
//     //   handler: (data) => this._handleClick(data)
//     // });
//   }

//   // private _handleClick(data: CellClickData) {
//   private _handleClick(data: any) {
//     if (!this.dataGrid || !data)
//       return;

//     const item = this.dataGrid.items[data.row];

//     if (item)
//       this.notify(item);
//   }
// }
