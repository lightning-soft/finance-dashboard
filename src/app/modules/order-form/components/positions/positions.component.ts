import { Component, Injector, Input } from '@angular/core';
import { IInstrument, IPosition, PositionsRepository, Side } from 'communication';
import { ItemsComponent } from 'core';
import { UntilDestroy } from '@ngneat/until-destroy';
import {NotifierService} from '../../../ui';

@UntilDestroy()
@Component({
  selector: 'positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.scss'],
})
export class PositionsComponent extends ItemsComponent<IPosition> {
  sides = [Side.Short, Side.Long];

  private _instrument: IInstrument;

  @Input()
  set instrument(value: IInstrument) {
    if (value?.id === this.instrument?.id)
      return;

    this._instrument = value;
    this._handleInstrumentChange();
  }

  get instrument(): IInstrument {
    return this._instrument;
  }

  constructor(
    protected _repository: PositionsRepository,
    protected _injector: Injector,
    public notifier: NotifierService,

  ) {
    super();
    this.autoLoadData = false;
  }

  getPositionsBySide(side: Side) {
    return this.builder.items.filter(item => item.side === side);
  }

  private _handleInstrumentChange() {
    this.loadData({ instrument: this.instrument });
  }

  deleteAll(side?: Side) {
    console.log(side);
  }

  trackByFn(item) {
    return item.id;
  }
}
