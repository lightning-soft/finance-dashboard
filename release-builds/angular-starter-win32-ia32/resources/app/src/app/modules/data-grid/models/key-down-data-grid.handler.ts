// import {DataGridHandler} from './data-grid.handler';
// import {KeyDownHandler} from '../../Shared/models/key-down.handler';
// import {KeyCode} from '../../Shared/models/key-code';

// export interface IKeyDownDataGridHandlerConfig<T> {
//   keyCode: KeyCode;
//   handler: (item: T[]) => void;
// }

// export class KeyDownDataGridHandler<T> extends DataGridHandler<T> {
//   tableHandler: KeyDownHandler;

//   constructor(config: IKeyDownDataGridHandlerConfig<T>) {
//     super(config as any);
//     this.tableHandler = new KeyDownHandler({
//       handler: () => this._handlePress(),
//       keyCode: config.keyCode,
//     });
//   }

//   private _handlePress() {
//     if (!this.dataGrid)
//       return;

//     const items = this.dataGrid.items.filter((i: any) => i.selected);

//     if (items.length)
//       this.notify(items);
//   }
// }
