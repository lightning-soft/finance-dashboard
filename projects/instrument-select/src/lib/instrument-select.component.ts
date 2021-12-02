import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { IAccount, IInstrument, InstrumentsRepository } from 'trading';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InstrumentDialogComponent } from "instrument-dialog";
import { NzModalService } from "ng-zorro-antd";

@Component({
  selector: 'instrument-select',
  templateUrl: './instrument-select.component.html',
  styleUrls: ['./instrument-select.component.scss']
})
export class InstrumentSelectComponent extends ItemsComponent<IInstrument> implements OnInit {
  private _instrument: IInstrument = null;

  get instrument() {
    return this._instrument;
  }

  @Input() set instrument(value) {
    if (value?.id !== this._instrument?.id) {
      this._instrument = value;
      this.value = value.id as string;
    }
  }

  @Input() placeholder = 'Select instrument';

  private _account: IAccount;

  @Input()
  set account(value: IAccount) {
    this._account = value;
  }

  get account() {
    return this._account;
  }

  @Input() className = '';
  @Output() instrumentChange: EventEmitter<IInstrument> = new EventEmitter();

  get loading(): boolean {
    return this._loading;
  }

  value = '';
  opened = false;

  constructor(
    protected _injector: Injector,
    protected _repository: InstrumentsRepository,
    private _modalService: NzModalService,
  ) {
    super();
    this.autoLoadData = false;
  }

  protected _getItems(params: any) {
    return super._getItems({ ...params, accountId: this.account?.id });
  }

  loadMore() {
    this.skip = this.items.length;

    this.loadData();
  }

  handleOpenChange(opened: boolean, select) {
   if (opened) {
     this.opened = false;
     this.openDialog();
   }
  }

  clear() {
    this.value = '';
  }

  openDialog() {
    const modal = this._modalService.create({
      nzContent: InstrumentDialogComponent,
      nzWidth: 386,
      nzWrapClassName: '',
      nzClassName: 'instrument-dialog',
      nzFooter: null,
      nzComponentParams: {
         accountId: this.account?.id,
        // connectionId: this.connection.id,
      }
    });
    modal.afterClose
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res) {
          this.instrument = res;
          this.instrumentChange.emit(res);
        }
      });
  }
}
