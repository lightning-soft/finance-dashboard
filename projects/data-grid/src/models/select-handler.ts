// import {Events} from '../../Shared/models/handler';
// import {ClickHandler} from '../../Shared/models/click.handler';
// import {KeyCode} from '../../Shared/models/key-code';

// interface IItem {
//   selected: boolean;
// }

// interface DataGrid {
//   items: IItem[];
//   selectedChange: (index: number) => void;
// }

// export class SelectHandler extends ClickHandler {
//   private readonly _dataGrid: DataGrid;

//   private _lastSelectedIndex: number;
//   private _startSelectedIndex: number;

//   private get _items(): IItem[] {
//     return this._dataGrid.items;
//   }

//   selectable = true;

//   constructor(dataGrid: DataGrid) {
//     super();
//     this._dataGrid = dataGrid;

//     this.events.push(Events.Keydown);
//     this.events.push(Events.ContextMenu);
//   }

//   handleEvent(event: Event): boolean {
//     if (!event || !this.selectable)
//       return;

//     switch (event.type) {
//       case Events.Click:
//       case Events.Touchend:
//       case Events.ContextMenu:
//         this._handleMouseEvent(event as MouseEvent);
//         break;
//       case Events.Keydown:
//         this._handleKeyboardEvent(event as KeyboardEvent);
//         break;
//     }
//   }

//   private _handleKeyboardEvent(event: KeyboardEvent) {
//     let index = this._lastSelectedIndex;

//     if (!event || index == null || index < 0 || index >= this._items.length)
//       return;

//     if (event.target)
//       switch ((event.target as any).tagName) {
//         case 'MAT-SELECT':
//         case 'SELECT':
//         case 'TEXTAREA':
//           return;
//         default:
//           break;
//       }

//     switch (event.keyCode) {
//       case KeyCode.UP:
//         index--;
//         break;
//       case KeyCode.DOWN:
//         index++;
//         break;
//       case KeyCode.A:
//         if (event.ctrlKey || event.metaKey) {
//           this._selectAll();
//           event.preventDefault();
//         }
//         return;
//       default:
//         return;
//     }

//     if (index > this._items.length)
//       index = this._items.length;
//     else if (index < 0)
//       index = 0;

//     const {_startSelectedIndex, _lastSelectedIndex} = this;
//     if (event.shiftKey
//       && _startSelectedIndex != null
//       && _lastSelectedIndex != null
//       && Math.abs(_startSelectedIndex - index) < Math.abs(_startSelectedIndex - _lastSelectedIndex)) {
//       this._select(this._lastSelectedIndex, true);
//       this._lastSelectedIndex = index;
//       return;
//     }

//     if (event.shiftKey && this._startSelectedIndex === index) {
//       this._lastSelectedIndex = this._startSelectedIndex;
//       return;
//     }

//     this._select(index, event.shiftKey);

//     // if (!event.shiftKey)
//     //   this._startSelectedIndex = index;
//   }

//   private _handleMouseEvent(event: MouseEvent) {
//     let multi = event && (event.ctrlKey || event.metaKey || event.type === Events.Touchend),
//       currentTarget = event.currentTarget,
//       dataSelector = 'row',
//       target: any = event.target,
//       getDataFromElement = (t) => {
//         if (t === currentTarget)
//           return null;

//         if (t.dataset && t.dataset[dataSelector] != null)
//           return t.dataset[dataSelector];
//         else
//           return getDataFromElement(t.parentElement);
//       },
//       item = getDataFromElement(target);

//     if (item != null) {
//       if (event.type === Events.ContextMenu && this._items[item] && this._items[item].selected) {
//         this._startSelectedIndex = this._lastSelectedIndex;
//         return true;
//       }

//       this._select(item, multi);
//       this._startSelectedIndex = this._lastSelectedIndex;
//       return true;
//     }
//   }

//   _select(row: string | number, multi) {
//     if (row == null)
//       return;

//     const index = typeof row === 'string' ? parseInt(row, 10) : row;

//     if (isNaN(index))
//       return;

//     const item = this._items[index];

//     if (!item)
//       return;

//     if (!multi) {
//       this._items.forEach(i => i.selected = false);
//       this._startSelectedIndex = null;
//     } else if (multi && this._startSelectedIndex == null) { // set start select index from keyboard
//       this._startSelectedIndex = this._lastSelectedIndex;
//     }

//     item.selected = !item.selected;
//     this._lastSelectedIndex = index;

//     if (this._dataGrid.selectedChange)
//       this._dataGrid.selectedChange(index);
//   }

//   private _selectAll() {
//     for (let item of this._items)
//       item.selected = true;

//     if (this._dataGrid.selectedChange)
//       this._dataGrid.selectedChange(this._lastSelectedIndex);
//   }
// }
