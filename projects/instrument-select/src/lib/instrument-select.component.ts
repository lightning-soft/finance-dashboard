import { Component, ElementRef, EventEmitter, HostListener, Injector, Input, Output, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { IInstrument, InstrumentsRepository } from 'trading';
import { AccountsManager } from 'accounts-manager';

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
  isVisible = false;

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

  @HostListener('window:click', ['$event'])
  handleBlur(): void {
    if (this.isVisible)
      this.isVisible = false;
  }

  handleBubbling(event: Event): void {
    event.stopPropagation();
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }

  ngOnInit() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() =>
        this._repository = this._repository.forConnection(this._accountsManager.getActiveConnection()));

    super.ngOnInit();
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
    this.toggleVisibility();
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
}

