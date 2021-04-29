import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { ItemsBuilder, ItemsComponent, StringHelper } from 'base-components';
import { Id } from 'communication';
import { ContextMenuService } from 'context-menu';
import { CellClickDataGridHandler, Column, DataGrid } from 'data-grid';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { NzContextMenuService } from 'ng-zorro-antd';
import { finalize, first } from 'rxjs/operators';
import { IInstrument, InstrumentsRepository, IQuote, Level1DataFeed } from 'trading';
import { InstrumentSelectComponent } from '../../instrument-select/src/lib/instrument-select.component';
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

  builder = new ItemsBuilder<IInstrument, WatchlistItem>({
    wrap: (item) => new WatchlistItem(item),
    unwrap: (item) => item.instrument,
  });

  private _itemsMap: Map<Id, WatchlistItem> = new Map();

  @ViewChild(DataGrid)
  private _dataGrid: DataGrid;

  @ViewChild(InstrumentSelectComponent)
  private _instrumentSelect: InstrumentSelectComponent;

  // @ViewChild('menu', { static: false })
  // private _menuTemplate: NzDropdownMenuComponent;

  handlers = [
    new CellClickDataGridHandler<WatchlistItem>({
      column: 'close',
      handler: (data) => this.delete(data.item),
    }),
  ];

  constructor(
    protected _repository: InstrumentsRepository,
    private _levelOneDatafeed: Level1DataFeed,
    protected cd: ChangeDetectorRef,
    private nzContextMenuService: NzContextMenuService,
    private contextMenuService: ContextMenuService,
    protected _accountsManager: AccountsManager,
    protected _injector: Injector
  ) {
    super();
    this.autoLoadData = false;

    this.columns = headers.map(name => ({ name, tableViewName: StringHelper.capitalize(name), visible: true, canHide: true }));

    this.setTabIcon('icon-widget-watchlist');
    this.setTabTitle('Watchlist');
  }

  closeMenu(): void {
    this.nzContextMenuService.close();
  }


  ngOnInit(): void {
    this.onRemove(this._levelOneDatafeed.on((quotes) => this._processQuotes(quotes as any)));
  }

  selectInstrument(instrument: IInstrument) {
    this.addInstruments(instrument);
    this._instrumentSelect.clear();
  }

  addInstruments(instruments: IInstrument | IInstrument[]) {
    if (!Array.isArray(instruments))
      instruments = [instruments];

    instruments = instruments.filter(i => i != null && !this._itemsMap.has(i.id));

    if (instruments.length < 1)
      return;

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

  private _handleResize() {
    this._dataGrid.resize();
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
        this._handleResize();
        return true;
    }

    return false;
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

  loadInstruments(params) {
    this._repository.getItemsByIds(params)
      .pipe(
        untilDestroyed(this),
        first(),
        finalize(this.showLoading(true))
      )
      .subscribe(
        (response) => { this.addInstruments(response) },
        (error) => this._handleLoadingError(error),
      );
  }
}
