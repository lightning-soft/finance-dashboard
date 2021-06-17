import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { IInstrument, InstrumentsRepository } from 'trading';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { Id } from 'communication';
import { Storage } from 'storage';

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
  theEnd = false;


  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  scroller$ = new Subject();
  tabIndex = 0;

  constructor(protected _injector: Injector,
              private _modal: NzModalRef,
              private _storage: Storage,
              protected _repository: InstrumentsRepository) {
    super();
    this.autoLoadData = { onConnectionChange: true };
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
      if (end === total) {
        this.query.skip = this.items.length;
        this.query.accountId = this.accountId;
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

  selectInstrument(item: any) {
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

}
