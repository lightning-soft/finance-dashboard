import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { Id } from 'communication';
import { ContextMenuService, IContextMenuInfo } from 'context-menu';
import { CellClickDataGridHandler, ContextMenuDataGridHandler, DataGrid, Events, IContextMenuData } from 'data-grid';
import { ILayoutNode, LayoutHandler, LayoutNode, LayoutNodeEvent } from 'layout';
import { NzContextMenuService } from 'ng-zorro-antd';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NotifierService } from 'notifier';
import { IInstrument, InstrumentsRepository, IQuote, ITrade, LevelOneDataFeedService } from 'trading';
import { WatchlistItem } from './models/watchlist.item';

export interface WatchlistComponent extends ILayoutNode { }

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

  isLoading = false;

  items: WatchlistItem[] = [];

  private _itemsMap: Map<Id, WatchlistItem> = new Map();
  private _instruments: IInstrument[] = [];

  private subscriptions = [] as Function[];

  @ViewChild(DataGrid)
  private _dataGrid: DataGrid;

  @ViewChild('menu', { static: false })
  private _menuTemplate: NzDropdownMenuComponent;

  public selecInstrumentmentName = '';
  private _selectedInstrument: WatchlistItem;

  constructor(
    public _instrumentsRepository: InstrumentsRepository,
    private _levelOneDatafeed: LevelOneDataFeedService,
    protected cd: ChangeDetectorRef,
    public notifier: NotifierService,
    private layoutHandler: LayoutHandler,
    private nzContextMenuService: NzContextMenuService,
    private contextMenuService: ContextMenuService,
    protected _accountsManager: AccountsManager,
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
    this.initRepository();

    // this.subscriptions.push(this._levelOneDatafeed.on((quotes) => this._processQuotes(quotes as any)));

    /**
     * TEST DATA TRADE
     */
    // this.addNewInstrument({ symbol: "ESZ0", exchange: "CME", tickSize: 0.01, id: "ESZ0" });
  }

  initRepository() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() =>
        this._instrumentsRepository = this._instrumentsRepository.forConnection(this._accountsManager.getActiveConnection()));
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
      this.notifier.showSuccess(`Instrument ${instrument.symbol} already exist`);
    } else {
      this.addToWatchlist(instrument);
      this.notifier.showSuccess(`Instrument ${instrument.symbol} added`);
    }
  }

  private addToWatchlist(instruments: IInstrument | IInstrument[]) {
    if (instruments == null) {
      throw new Error('Invalid instrument');
    }

    if (!Array.isArray(instruments)) {
      instruments = [instruments];
    }

    for (const instrument of instruments) {
      this._instruments.push(instrument);
    }

    const items: WatchlistItem[] = instruments.map(i => new WatchlistItem(i));
    for (const item of items) {
      this._itemsMap.set(item.instrumentId, item);
    }

    this.items = [...this._itemsMap.values()];
    this.subscribeForRealtime(instruments);
  }

  delete(item: WatchlistItem) {
    const instrument = this._instruments.find((inst: IInstrument) => inst.id === item.instrumentId);

    this._levelOneDatafeed.unsubscribe(instrument);
    this._instruments = this._instruments.filter((inst: IInstrument) => inst.id !== item.instrumentId);

    this._itemsMap.delete(item.instrumentId);
    this.items = this.items.filter(i => i.instrumentId !== item.instrumentId);

    this.notifier.showSuccess(`Instrument ${item.name.value} deleted`);
  }

  subscribeForRealtime(instruments: IInstrument[]) {
    for (const instrument of instruments) {
      this._levelOneDatafeed.subscribe(instrument);
    }
  }

  _processQuotes(quotes: IQuote[] | IQuote) {
    const quotesList = Array.isArray(quotes) ? quotes : [quotes];

    for (const quote of quotesList) {
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
      this.isLoading = true;

      this.initRepository();

      this._instrumentsRepository.getItemsByIds(state.items)
        .pipe(
          untilDestroyed(this)
        )
        .subscribe(
          (instruments) => {
            /**
             * TMP add id to instrument
             */
            for (const instrument of instruments) {
              instrument.id = instrument.symbol;
            }

            this.addToWatchlist(instruments);
            this.isLoading = false;
          },
          (e) => {
            console.error(e);
            this.isLoading = false;
          },
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

  private handleTrade(trade: ITrade): void {
    const { AskInfo, BidInfo, Timestamp } = trade;

    const instrument = this._instruments.find((inst: IInstrument) => inst.symbol === trade.Instrument.Symbol);
    const watchlistItem = this._itemsMap.get(instrument.id);

    watchlistItem.ask.updateValue(AskInfo.Price);
    watchlistItem.bid.updateValue(BidInfo.Price);
    watchlistItem.timestamp.updateValue(Timestamp);
  }
}
