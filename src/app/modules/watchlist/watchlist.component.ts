import {Component, OnDestroy, OnInit} from '@angular/core';
import {IQuote, Datafeed, Id, IInstrument, InstrumentsRepository} from 'communication';
import {WatchlistItem} from './models/watchlist.item';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {IViewBuilderStore, ViewBuilderStore} from '../data-grid';
import { IconComponent, iconComponentSelector } from '../data-grid/models/cells/components/icon-conponent';

@UntilDestroy()
@Component({
  selector: 'watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
  providers: [
    {
      multi: true,
      provide: IViewBuilderStore,
      useValue: new ViewBuilderStore({
        [iconComponentSelector]: IconComponent
      })
    }
  ]
})
export class WatchlistComponent  implements OnInit, OnDestroy {
  headers = ['name', 'ask', 'bid', 'timestamp',];

  items: WatchlistItem[] = [];
  private _itemsMap = new Map<Id, WatchlistItem>();

  private subscriptions = [] as Function[];


  constructor(
    private _instrumentsRepository: InstrumentsRepository,
    private _datafeed: Datafeed
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this._datafeed.on((quotes) => this._processQuotes(quotes)));
    this._instrumentsRepository.getItems()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(
        (instruments: IInstrument[]) => this.addToWatchlist(instruments),
        (e) => console.error(e)
      );

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

    this.items = [...items, ...this.items];
    this.subscribeForRealtime(instruments);
  }

  delete(item) {
    this._itemsMap.delete(item.instrumentId);
    this.items = this.items.filter(i => i.instrumentId !== item.instrumentId);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(item => item());
  }

}
