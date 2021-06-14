import { Component, Injector, ViewChild } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { IInstrument } from 'trading';
import { InstrumentsRepository } from 'trading';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from "rxjs";
import { Id } from 'communication';

@Component({
  selector: 'instrument-dialog',
  templateUrl: './instrument-dialog.component.html',
  styleUrls: [
    './instrument-dialog.component.scss',
  ]
})
@UntilDestroy()
export class InstrumentDialogComponent extends ItemsComponent<IInstrument> {
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

  constructor(protected _injector: Injector,
              private _modal: NzModalRef,
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

}
