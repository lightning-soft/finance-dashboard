import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { Id, ItemsComponent } from 'base-components';
import { IAccount, IInstrument, InstrumentsRepository } from 'trading';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'instrument-select',
  templateUrl: './instrument-select.component.html',
  styleUrls: ['./instrument-select.component.scss']
})
export class InstrumentSelectComponent extends ItemsComponent<IInstrument> implements OnInit {
  private _instrument: IInstrument = null;

  get instrument() {
    return this._instrument;
  }

  @Input() set instrument(value) {
    if (value?.id !== this._instrument?.id) {
      this._instrument = value;
      this.value = value.id as string;
    }
  }

  @Input() placeholder = 'Select instrument';

  private _account: IAccount;

  @Input()
  set account(value: IAccount) {
    this._account = value;
  }

  get account() {
    return this._account;
  }

  @Input() className = '';
  @Output() instrumentChange: EventEmitter<IInstrument> = new EventEmitter();

  get loading(): boolean {
    return this._loading;
  }

  value = '';

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository,
  ) {
    super();
    this.autoLoadData = false;
  }

  search(criteria = '') {
    this.builder.replaceItems([]);

    this.loadData({
      criteria,
      take: 20,
    });
  }

  loadMore() {
    this.skip = this.items.length;

    this.loadData();
  }

  handleModelChange(id: Id) {
    const instrument = this.items.find(i => i.id === id);

    if (!instrument._loaded) {
      const hide = this.showLoading();
      this._repository.getItemById(instrument.symbol, { exchange: instrument.exchange })
        .pipe(untilDestroyed(this))
        .subscribe(
          (_instrument: IInstrument) => {
            Object.assign(instrument, _instrument, { _loaded: true, tickSize: _instrument.increment });
            this.instrumentChange.emit(instrument);
            hide();
          },
          (err) => this._handleLoadingError(err),
        );
    } else {
      this.instrumentChange.emit(instrument);
    }
  }

  handleOpenChange(opened: boolean) {
    if (opened) {
      this.search();
    } else {
      setTimeout(() => {
        this._dataSubscription?.unsubscribe();
      });
    }
  }

  clear() {
    this.value = '';
  }
}
