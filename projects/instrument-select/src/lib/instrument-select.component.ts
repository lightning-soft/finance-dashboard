import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
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
  @Input() size = 'default';
  @Output() handleInstrumentChange: EventEmitter<IInstrument> = new EventEmitter();

  get loading(): boolean {
    return this._loading;
  }

  value = '';

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository,
    protected _accountsManager: AccountsManager,
  ) {
    super();
    this.autoLoadData = {};
  }

  ngOnInit() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();

        this._repository = this._repository.forConnection(connection);
      });

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

    this.loadData(this._params);
  }

  handleModelChange(id: Id) {
    const instrument = this.items.find(i => i.id === id);

    this.handleInstrumentChange.emit(instrument);
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
}
