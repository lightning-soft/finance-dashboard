import { Component, Injector } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { InstrumentsRepository } from 'communication';
import { IInstrument } from 'trading';

@Component({
  selector: 'instrument-select',
  template: `
    <nz-select
      [(ngModel)]="instrument"
      (nzScrollToBottom)="loadMore()"
      nzPlaceHolder="Symbol"
      nzAllowClear
      nzShowSearch
      nzServerSearch
      (nzOnSearch)="onSearch($event)"
      [nzDropdownRender]="renderTemplate"
    >
      <nz-option *ngFor="let o of items" [nzValue]="o" [nzLabel]="o.symbol"></nz-option>
    </nz-select>
    <ng-template #renderTemplate>
      Loading....
    </ng-template>
    <!-- <input #autoComplete nz-input [(ngModel)]="instrument" (focus)="contextMenu($event, menu)"> -->
    <!-- <i
      (click)="autoComplete.select()"
      class="instrument-bar__arrow icon-arrow-dropdown"></i> -->

    <!-- <nz-autocomplete
      nzOverlayClassName="toolbar-dropdown"
      #auto
      >
        <nz-auto-option *ngFor="let option of items" [nzValue]="option" [nzLabel]="option.symbol">
          {{option.symbol}}
        </nz-auto-option>
    </nz-autocomplete> -->
  `,
  styles: [
    `
  }`
  ]
})
export class InstrumentSelectComponent extends ItemsComponent<IInstrument> {
  private _instrument: IInstrument;

  get instrument(): IInstrument {
    return this._instrument;
  }

  set instrument(instrument: IInstrument) {
    if (typeof instrument === 'string') {
      // this._search(instrument as string);
      return;
    }
    console.log('instrument', instrument);
  }

  private _loadedParams;

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository,
  ) {
    super();
    this.autoLoadData = {
      onInit: true,
    };
  }

  onSearch(criteria: string) {
    this._loadedParams = { criteria, skip: 0, take: 10 };
    this.loadData(this._loadedParams);
  }

  loadMore() {
    const { skip, take } = this._loadedParams;
    this._loadedParams = {
      ...this._loadedParams,
      skip: skip + 10,
      take: 10,
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
}

