import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClockComponent } from "./clock/clock.component";
import { AddTimezoneModalComponent } from "./add-timezone-modal/add-timezone-modal.component";
import { TimezonesService } from "./timezones.service";
import { UtcPipe } from "./utc.pipe";
import { NzCheckboxModule, NzDropDownModule, NzInputModule } from "ng-zorro-antd";
import { TimezoneItemComponent } from "./timezone-item/timezone-item.component";

@NgModule({
  imports: [
    CommonModule,
    NzDropDownModule,
    NzCheckboxModule,
    NzInputModule
  ],
  declarations: [
    ClockComponent,
    TimezoneItemComponent,
    AddTimezoneModalComponent,
    UtcPipe
  ],
  exports: [
    ClockComponent
  ],
  providers: [
    TimezonesService
  ]
})
export class TimezonesClockModule {}
