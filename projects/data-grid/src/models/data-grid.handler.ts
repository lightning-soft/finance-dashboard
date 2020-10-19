// import {IHandler} from '../../Shared/models/handler';

// export interface IDataGridHandlerConfig<T> {
//   handler: (item: T) => void;
// }

// export abstract class DataGridHandler<T = any> {
//   abstract tableHandler: IHandler;

//   dataGrid: { items: T[] };

//   protected handler: (item: any) => void;

//   constructor(config: IDataGridHandlerConfig<T>) {
//     this.handler = config.handler;
//   }

//   notify(item: any) {
//     if (item && typeof this.handler === 'function')
//       this.handler(item);
//   }
// }
