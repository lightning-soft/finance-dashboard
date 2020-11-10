import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { IInstrument, InstrumentsRepository } from 'trading';
import { AccountsManager } from '../../../accounts-manager/src/accounts-manager';

@Component({
  selector: 'instrument-select',
  templateUrl: './instrument-select.component.html',
  styleUrls: ['./instrument-select.component.scss']
})
export class InstrumentSelectComponent extends ItemsComponent<IInstrument> {

  @ViewChild('searchInput') input: ElementRef;
  @ViewChild('searchList') list: ElementRef;

  @Input() instrument: IInstrument;
  @Output() instrumentChange: EventEmitter<IInstrument> = new EventEmitter();

  private _loadedParams;

  searchString: string;
  isHidden = true;

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository,
    protected _accountsManager: AccountsManager,
  ) {
    super();
    this.autoLoadData = {
      onInit: true,
    };

    this._hideSelect = this._hideSelect.bind(this);
  }

  ngOnInit() {
    super.ngOnInit();
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() =>
        this._repository = this._repository.forConnection(this._accountsManager.getActiveConnection()));
  }

  toggleSearch() {
    this.isHidden = !this.isHidden;

    setTimeout(() => {
      if (!this.isHidden) {
        this.input.nativeElement.focus();
        window.addEventListener('click', this._hideSelect);
      }
    }, 0);
  }

  onSearch(criteria: string) {
    this._loadedParams = {
      criteria: criteria ?? '',
      skip: 0,
      take: 20
    };
    this.loadData(this._loadedParams);
  }

  compareInstrument = (o1: any | string, o2: any) => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.id : o1.id === o2.id;
    } else {
      return false;
    }
  }

  select(instrument: IInstrument) {
    this.instrumentChange.emit(instrument);
    this._hideSelect();
  }

  lazyLoad(): void {
    if (this.loading) return;
    const { clientHeight, scrollHeight, scrollTop } = this.list.nativeElement;

    if (clientHeight + scrollTop > scrollHeight * 0.85)
      this.loadMore();
  }

  private loadMore(): void {
    const { skip, take } = this._loadedParams;
    this._loadedParams = {
      ...this._loadedParams,
      skip: skip + 10,
      take: 10,
    };

    this.loadData(this._loadedParams);
  }

  private _hideSelect() {
    this.isHidden = true;
    window.removeEventListener('click', this._hideSelect);
  }
}

