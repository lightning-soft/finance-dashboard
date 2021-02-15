import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { Id, ItemsComponent } from 'base-components';
import { IInstrument, InstrumentsRepository } from 'trading';

@Component({
  selector: 'instrument-select',
  templateUrl: './instrument-select.component.html',
  styleUrls: ['./instrument-select.component.scss']
})
export class InstrumentSelectComponent extends ItemsComponent<IInstrument> implements OnInit {

  @Input() instrument: IInstrument = null;
  @Input() placeholder = 'Select instrument';
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

  ngOnInit() {
    super.ngOnInit();

    if (this.instrument) {
      this.value = this.instrument?.id as string;
    }
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
      this._repository.getItemById(instrument.symbol)
        .subscribe(
          (_instrument: IInstrument) => {
            Object.assign(instrument, _instrument, { _loaded: true })
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
