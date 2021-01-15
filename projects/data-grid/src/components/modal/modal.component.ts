import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Column } from 'data-grid';

@Component({
  selector: 'modal-component',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ModalComponent implements OnDestroy {
  @Input()
  public columns: Column[] = [];

  @Input() public showHeaders: boolean;

  constructor() {
  }

  ngOnDestroy(): void {
  }

}
