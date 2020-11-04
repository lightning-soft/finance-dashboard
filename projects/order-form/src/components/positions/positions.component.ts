import { ChangeDetectorRef, Component, Injector, Input } from '@angular/core';
import { IInstrument, IPosition, IPositionParams, PositionStatus, Side } from 'trading';
import { GroupItemsBuilder, ItemsComponent } from 'base-components';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NotifierService } from 'notifier';
import { PositionsRepository } from 'communication';

@UntilDestroy()
@Component({
  selector: 'positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.scss'],
})
export class PositionsComponent extends ItemsComponent<IPosition, IPositionParams> {
  builder = new GroupItemsBuilder();

  sides = [Side.Short, Side.Long];

  private _instrument: IInstrument;

  @Input()
  set instrument(value: IInstrument) {
    if (value?.id === this.instrument?.id)
      return;

    this._instrument = value;
    this.refresh();
  }

  get instrument(): IInstrument {
    return this._instrument;
  }

  get params(): IPositionParams {
    return {
      ...this._params,
      status: PositionStatus.Open,
      instrument: this.instrument,
    };
  }

  constructor(
    protected _repository: PositionsRepository,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _injector: Injector,
    public notifier: NotifierService,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      groupBy: ['side'],
      order: 'desc',
      filter: (item: IPosition) => item.status !== PositionStatus.Close,
    });
  }

  deleteAll(side?: Side) {
    let items = this.items;
    if (side !== null)
      items = items.filter(i => i.side === side);

    this.repository
      .deleteMany({ ids: items.map(i => i.id) })
      .subscribe(
        () => this._showSuccessDelete(),
        err => this._handleDeleteError(err),
      );
  }

  trackByFn(item) {
    return item.id;
  }
}
