import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzModalService, NzPlacementType } from 'ng-zorro-antd';
import { interval } from 'rxjs';
import { AddTimezoneModalComponent } from '../add-timezone-modal/add-timezone-modal.component';
import { ITimezone, Timezone } from '../timezones';
import { TimezonesService } from '../timezones.service';
import { TIMEZONES } from 'trading';

@UntilDestroy()
@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss'],
})
export class ClockComponent implements OnInit {
  time: number;
  timezones: ITimezone[] = [];
  enabledTimezones: ITimezone[] = [];
  localTimezone: ITimezone;

  @Input() dropdownPlacement: NzPlacementType;
  @Input() maxAdditionalTimezonesCount = 1;

  @Output() handleToggleDropdown = new EventEmitter<boolean>();

  get canEnableTimezone(): boolean {
    return this.timezonesService.canEnableTimezone;
  }

  constructor(private modalService: NzModalService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _ngZone: NgZone,
    private timezonesService: TimezonesService) {
    this.timezonesService.maxEnabledTimezonesCount = this.maxAdditionalTimezonesCount;

    this._changeDetectionRef.detach();
    this._ngZone.runOutsideAngular(() => {
      interval(1000)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.time = Date.now();
          this._detectChanges();
        });
    });
  }

  ngOnInit(): void {
    this.localTimezone = this._getLocalTimezone();

    this.timezonesService.timezonesData$
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.timezones = data.timezones;
        this.enabledTimezones = this.timezonesService.enabledTimezones;
        this.localTimezone.name = data.localTimezoneTitle;
        this._detectChanges();
      });
  }

  addTimezone(): void {
    this.modalService.create({
      nzContent: AddTimezoneModalComponent,
      nzWrapClassName: 'timezones-modal vertical-center-modal',
      nzFooter: null,
      nzWidth: 416
    });
  }

  deleteTimezone(timezone: ITimezone): void {
    this.timezonesService.delete(timezone);
  }

  updateTimezoneName(timezone: ITimezone, name: string): void {
    this.timezonesService.rename(timezone, name);
  }

  toggleTimezone(timezone: ITimezone, enabled: boolean): void {
    this.timezonesService.toggleEnabled(timezone, enabled);
  }

  resetTimezone(timezone: ITimezone): void {
    this.timezonesService.resetItem(timezone);
  }

  renameLocalTitle(title: string): void {
    this.timezonesService.changeLocalTitle(title);
  }

  resetLocalTitle(): void {
    this.timezonesService.resetLocalTitle();
  }

  private _getLocalTimezone(): ITimezone {
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const matchedTimezones = TIMEZONES.filter(timezone => {
      return timezone.utc.some(i => i === timezoneName);
    });

    const supposedTimezone = matchedTimezones.reduce((acc, item) => {
      return item.utc.length < acc?.utc.length ? item : acc;
    }) as any;

    return supposedTimezone ? new Timezone(supposedTimezone) : null;
  }

  _detectChanges() {
    this._changeDetectionRef.detectChanges();
  }
}
