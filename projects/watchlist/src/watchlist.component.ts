import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { ItemsBuilder, ItemsComponent } from 'base-components';
import { Id } from 'communication';
import { ContextMenuService } from 'context-menu';
import { CellClickDataGridHandler, Column, DataGrid } from 'data-grid';
import { ILayoutNode, LayoutHandler, LayoutNode, LayoutNodeEvent } from 'layout';
import { NzContextMenuService } from 'ng-zorro-antd';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { finalize, first } from 'rxjs/operators';
import { IConnection, IInstrument, InstrumentsRepository, IQuote, Level1DataFeed } from 'trading';
import { WatchlistItem } from './models/watchlist.item';

const headers = [
  'name',
  'price',
  'timestamp',
  'ask',
  'bid',
  'volume',
  'exchange',
  'symbol',
  'close',
];

export interface WatchlistComponent extends ILayoutNode { }

export interface IWatchlistState {
  componentName: string;
  items?: string[];
  columns: Column[];
}

export type SubscribtionHandler = (data?: any) => void;

@UntilDestroy()
@Component({
  selector: 'watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
@LayoutNode()
export class WatchlistComponent extends ItemsComponent<IInstrument> implements OnInit {
  columns: Column[];

  isLoading = false;

  builder = new ItemsBuilder<IInstrument, WatchlistItem>();

  private _itemsMap: Map<Id, WatchlistItem> = new Map();
  private _instruments: IInstrument[] = [];

  @ViewChild(DataGrid)
  private _dataGrid: DataGrid;

  @ViewChild('menu', { static: false })
  private _menuTemplate: NzDropdownMenuComponent;

  public selecInstrumentmentName = '';
  private _selectedInstrument: WatchlistItem;

  handlers = [
    new CellClickDataGridHandler<WatchlistItem>({
      column: 'close',
      handler: (item) => this.delete(item),
    }),
  ];

  constructor(
    protected _repository: InstrumentsRepository,
    private _levelOneDatafeed: Level1DataFeed,
    protected cd: ChangeDetectorRef,
    private layoutHandler: LayoutHandler,
    private nzContextMenuService: NzContextMenuService,
    private contextMenuService: ContextMenuService,
    protected _accountsManager: AccountsManager,
    protected _injector: Injector
  ) {
    super();
    this.autoLoadData = false;

    this.columns = headers.map(header => ({ name: header, visible: true }));

    this.setTabIcon('icon-widget-watchlist');
    this.setTabTitle('Watchlist');
  }

  closeMenu(): void {
    this.nzContextMenuService.close();
  }


  ngOnInit(): void {
    this.onRemove(this._levelOneDatafeed.on((quotes) => this._processQuotes(quotes as any)));
  }

  addNewInstrument(instrument: IInstrument): void {
    if (!instrument) throw new Error('Invalid instrument');

    if (!this._itemsMap.has(instrument.id)) {
      this.addToWatchlist(instrument);
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

    this.builder.addItems(instruments);

    for (const item of instruments) {
      const _item = this.builder.items.find(i => i.id == item.id);

      if (!_item)
        continue;

      this._itemsMap.set(item.id, _item);
    }

    this.subscribeForRealtime(instruments);
  }

  delete(item: WatchlistItem) {
    this.builder.handleDeleteItems([item.instrument]);
  }

  subscribeForRealtime(instruments: IInstrument[]) {
    for (const instrument of instruments) {
      this._levelOneDatafeed.subscribe(instrument);
    }
  }

  _processQuotes(quotes: IQuote[] | IQuote) {
    const quotesList = Array.isArray(quotes) ? quotes : [quotes];

    for (const quote of quotesList) {
      const item = this.items.find((i: WatchlistItem) => i.instrument.symbol === quote.instrument.symbol);

      if (item) {
        item.processQuote(quote);
      }
    }
  }

  handleNodeEvent(name: LayoutNodeEvent, event: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
        this._dataGrid.detectChanges();
        break;
    }
  }

  saveState() {
    return {
      items: [...this.items.map(item => item.id)],
      columns: this.columns
    };
  }

  loadState(state?: IWatchlistState): void {
    this._subscribeToConnections();

    if (state && state.items)
      this.loadInstruments(state.items);

    if (state && state.columns)
      this.columns = state.columns;
  }

  _handleConnection(connection: IConnection) {
    this._repository = this._repository.forConnection(connection);
  }

  loadInstruments(params) {
    this._dataSubscription?.unsubscribe();

    this._dataSubscription = this._repository.getItemsByIds(params)
      .pipe(
        untilDestroyed(this),
        first(),
        finalize(this.showLoading(true))
      )
      .subscribe(
        (response) => this.builder.addItems(response),
        (error) => this._handleLoadingError(error),
      );
  }
}
