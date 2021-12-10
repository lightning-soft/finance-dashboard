import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { IInstrument, InstrumentsRepository, InstrumentType } from 'trading';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { Id, IPaginationResponse } from 'communication';
import { Storage } from 'storage';
import { NotifierService } from 'notifier';

const instrumentDialogStorageKey = 'instrumentDialogStorageKey';

@Component({
  selector: 'instrument-dialog',
  templateUrl: './instrument-dialog.component.html',
  styleUrls: [
    './instrument-dialog.component.scss',
  ]
})
@UntilDestroy()
export class InstrumentDialogComponent extends ItemsComponent<IInstrument> implements OnInit, OnDestroy {
  formControl = new FormControl();
  query: any = {
    take: 20,
    skip: 0,
    criteria: '',
  };
  accountId: Id;
  connectionId: Id;
  theEnd = false;
  typeArray = [null, InstrumentType.Future, InstrumentType.FutureOption,
    InstrumentType.FutureOptionStrategy, InstrumentType.FutureStrategy, InstrumentType.Spread];


  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  @ViewChild('inputElement') inputElement;

  scroller$ = new Subject();
  tabIndex = 0;

  constructor(protected _injector: Injector,
              private _modal: NzModalRef,
              private _storage: Storage,
              protected _notifier: NotifierService,
              protected _repository: InstrumentsRepository) {
    super();
    this.autoLoadData = { onConnectionChange: true, onInit: false };
    this.formControl.valueChanges
      .pipe(
        debounceTime(200),
        untilDestroyed(this))
      .subscribe((res) => {
        this.query.criteria = res;
        this.query.skip = 0;
        this.search();
      });
    this.scroller$
      .pipe(
        debounceTime(100),
        untilDestroyed(this)
      ).subscribe(() => {
      const end = this.viewport.getRenderedRange().end;
      const total = this.viewport.getDataLength();
      if (end === total && end !== 0) {
        this.query.skip = this.items.length;
        this.loadData(this.query);
      }
    });
  }

  ngOnInit() {
    const query = this._storage.getItem(instrumentDialogStorageKey);
    if (query) {
      this.tabIndex = query.tabIndex;
      this.query.criteria = query.criteria;
      this.formControl.patchValue(this.query.criteria);
    }
  }

  search() {
    this.builder.replaceItems([]);
    this.loadData(this.query);
  }

  loadData(params?: any) {
    params.accountId = this.accountId;
    params.connectionId = this.connectionId;
    const type = this.typeArray[this.tabIndex];
    if (type != null)
      params.type = this.typeArray[this.tabIndex];
    else
      delete params.type;

    super.loadData(params);
  }

  protected _handleResponse(response: IPaginationResponse<IInstrument>, params: any = {}) {
    super._handleResponse(response, params);
    if (!this.items.length)
      return;

    const firstItem = this.items[0];
    const isOneType = this.items.every((item) => item.type === firstItem.type);
    if (this.query.criteria !== '' && isOneType && this.typeArray[this.tabIndex] !== firstItem.type) {
      const index = this.typeArray.findIndex((value) => value === firstItem.type);
      this.tabChanged(index);
    }
  }

  selectInstrument(item: any) {
    if (item.tickSize === 0 && item.precision === 0) {
      this._repository.getItemById(item.id, { accountId: this.accountId, connectionId: this.connectionId })
        .pipe(untilDestroyed(this))
        .subscribe((instrument) => {
          this._modal.close(instrument);
        });
    } else
      this._modal.close(item);
  }

  onScroll(e) {
    this.scroller$.next();
  }

  trackByIdx(item) {
    return item.id;
  }

  ngOnDestroy() {
    const query = {
      criteria: this.query.criteria,
      tabIndex: this.tabIndex,
    };
    this._storage.setItem(instrumentDialogStorageKey, query);
  }

  tabChanged($event: number) {
    this.tabIndex = $event;
    this.search();
  }
}
