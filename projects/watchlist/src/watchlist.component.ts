import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Id } from 'communication';
import { ContextMenuService, IContextMenuInfo } from 'context-menu';
import { CellClickDataGridHandler, ContextMenuDataGridHandler, DataGrid, Events, IContextMenuData } from 'data-grid';
import { ILayoutNode, LayoutHandler, LayoutNode, LayoutNodeEvent } from 'layout';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { Datafeed, IInstrument, InstrumentsRepository, IQuote } from 'trading';
import { WatchlistItem } from './models/watchlist.item';

export interface IWatchlistState {
  componentName: string;
  items?: string[];
}

@UntilDestroy()
@Component({
  selector: 'watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
@LayoutNode()
export class WatchlistComponent implements OnInit, OnDestroy {
  headers = ['name', 'ask', 'bid', 'timestamp'];

  items: WatchlistItem[] = [];
  private _itemsMap = new Map<Id, WatchlistItem>();

  private subscriptions = [] as Function[];

  @ViewChild(DataGrid)
  private _dataGrid: DataGrid;

  @ViewChild('menu', { static: false })
  private _menuTemplate: NzDropdownMenuComponent;

  public selectedIstrumentName = '';
  private _selectedInstrument: WatchlistItem;

  constructor(
    public _instrumentsRepository: InstrumentsRepository,
    private _datafeed: Datafeed,
    protected cd: ChangeDetectorRef,
    public notifier: NotifierService,
    private layoutHandler: LayoutHandler,
    private nzContextMenuService: NzContextMenuService,
    private contextMenuService: ContextMenuService
  ) { }

  handlers = [
    new CellClickDataGridHandler<WatchlistItem>({
      column: 'name',
      events: [Events.DoubleClick],
      handler: (watchlistItem: WatchlistItem) => {
        this.layoutHandler.create('chart');

        this._instrumentsRepository.getItemById(watchlistItem.instrumentId).subscribe(instrument => {
          this.broadcastLinkData({ instrument });
        });
      },
    }),
    new ContextMenuDataGridHandler<IContextMenuData>({
      handler: (data: IContextMenuData) => {
        const { item, event } = data;

        const menuList: IContextMenuInfo = {
          event,
          list: [
            {
              title: 'Delete', action: () => {
                this.delete(item);
              }
            }
          ]
        };

        this.contextMenuService.showMenu(menuList);
      },
    }),
  ];

  closeMenu(): void {
    this.nzContextMenuService.close();
  }

  ngOnInit(): void {
    this.subscriptions.push(this._datafeed.on((quotes) => this._processQuotes(quotes)));
  }


    // for (let id = 0; id < 100; id++) {
    //   this.data.push(new WatchlistItem({ name: id.toString(), id }))
    // }

    // setInterval(() => {
    //   const count = Math.floor(randomIntFromInterval(0, this.data.length))
    //   const step = Math.floor(randomIntFromInterval(0, this.data.length / 4)) + 1

    //   for (let i = step; i < count; i += step) {
    //     const item = this.data[i];
    //     const updates = {};

    //     for (const key of ['ask', 'bid']) {
    //       const value = +item[key].value;
    //       updates[key] = randomIntFromInterval(value - 0.1, value + 0.1);
    //     }

    //     item.processQuote({
    //       instrumentId: i,
    //       timestamp: new Date(),
    //       ...updates,
    //     } as any);
    //   }
    // }, 100)

// addNewInstrument(form: NgForm): void {
//   const instrumentName = form.control.value.instrumentName;

//   if (instrumentName.trim()) {
//     const newInstrument: IInstrument = {
//       name: instrumentName.toUpperCase(),
//       tickSize: 0.1,
//       id: Date.now(),
//     }

//     this.addToWatchlist(newInstrument);
//     form.reset();
//   }
// }

  addNewInstrument(instrument: IInstrument): void {
    if (!instrument) throw new Error('Invalid instrument');

    if (this._itemsMap.has(instrument.id)) {
      this.notifier.showSuccess(`Instrument ${instrument.name} already exist`);
    } else {
      this.addToWatchlist(instrument);
      this.notifier.showSuccess(`Instrument ${instrument.name} added`);
    }
  }

  addToWatchlist(instruments: IInstrument | IInstrument[]) {
    if (instruments == null) {
      throw new Error('Invalid instrument');
    }

    if (!Array.isArray(instruments)) {
      instruments = [instruments];
    }

    const items: WatchlistItem[] = instruments.map(i => new WatchlistItem(i));
    for (const item of items) {
      this._itemsMap.set(item.instrumentId, item);
    }

    this.items = [...this._itemsMap.values()];
    this.subscribeForRealtime(instruments);
  }

  delete(item) {
    this._itemsMap.delete(item.instrumentId);
    this.items = this.items.filter(i => i.instrumentId !== item.instrumentId);

    this.notifier.showSuccess(`Instrument ${item.name.value} deleted`);
  }

  subscribeForRealtime(instruments: IInstrument[]) {
    for (const instrument of instruments) {
      this._datafeed.subscribe(instrument);
    }
  }

  _processQuotes(quotes: IQuote[]) {
    for (const quote of quotes) {
      const item = this._itemsMap.get(quote?.instrumentId);

      if (item) {
        item.processQuote(quote);
      }
    }
  }

  handleNodeEvent(name: LayoutNodeEvent, event: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
        this._dataGrid.layout();
        break;
      case LayoutNodeEvent.LinkData:
        break;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(item => item());
  }

  saveState() {
    return { items: [...this.items.map(item => item.instrumentId)] };
  }

  loadState(state?: IWatchlistState): void {
    if (state && state.items) {
      this._instrumentsRepository.getItemsByIds(state.items)
        .pipe(
          untilDestroyed(this)
        )
        .subscribe(
          instruments => this.addToWatchlist(instruments),
          (e) => console.error(e)
        );
    }
    // else {
    //   this._initalizeWatchlist();
    // }
  }

  // private _initalizeWatchlist(): void {
  //   this._instrumentsRepository.getItems()
  //     .pipe(
  //       untilDestroyed(this)
  //     )
  //     .subscribe(
  //       (response) => this.addToWatchlist(response.data),
  //       (e) => console.error(e)
  //     );
  // }

}
