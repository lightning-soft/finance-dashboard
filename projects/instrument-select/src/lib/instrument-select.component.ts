import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { ItemsComponent } from 'base-components';
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

  selectedValue = this.instrument?.id;

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository,
    protected _accountsManager: AccountsManager,
  ) {
    super();
    this.autoLoadData = {
      onInit: true,
    };
  }

  ngOnInit() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();

        this._repository = this._repository.forConnection(connection);
      });

    super.ngOnInit();
  }

  search(criteria: string) {
    this.loadData({
      criteria,
      take: 20,
    });
  }

  loadMore() {
    this.skip += this._params.take;

    this.loadData(this._params);
  }

  handleModelChange(id: string) {
    const instrument = this.items.find(i => i.id === id);

    this.handleInstrumentChange.emit(instrument);
  }
}
