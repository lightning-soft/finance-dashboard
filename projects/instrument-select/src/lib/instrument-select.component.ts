import { Component, Injector } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { InstrumentsRepository } from 'communication';
import { IInstrument } from 'trading';

@Component({
  selector: 'instrument-select',
  template: `
    <input #autoComplete nz-input [(ngModel)]="instrument" [nzAutocomplete]="auto">
    <i
      (click)="autoComplete.select()"
      class="instrument-bar__arrow icon-arrow-dropdown"></i>
    <nz-autocomplete nzOverlayClassName="toolbar-dropdown" #auto [compareWith]="compareInstrument">
      <nz-auto-option *ngFor="let option of items" [nzValue]="option" [nzLabel]="option.symbol">
        {{option.symbol}}
      </nz-auto-option>
    </nz-autocomplete>
  `,
  styles: [
  ]
})
export class InstrumentSelectComponent extends ItemsComponent<IInstrument> {
  private _instrument: IInstrument;

  get instrument(): IInstrument {
    return this._instrument;
  }

  set instrument(instrument: IInstrument) {
    if (typeof instrument === 'string') {
      this._search(instrument as string);
      return;
    }
  }

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository
  ) {
    super();
  }

  _search(criteria: string) {
    this.loadData({ criteria });
  }

  compareInstrument = (o1: any | string, o2: any) => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.id : o1.id === o2.id;
    } else {
      return false;
    }
  }
}

