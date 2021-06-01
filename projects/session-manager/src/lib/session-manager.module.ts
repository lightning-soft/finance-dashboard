import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataSelectModule } from 'data-select';
import { TimeSelectModule } from 'time-select';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzButtonModule, NzFormModule, NzInputModule, NzModalModule, NzSelectModule } from 'ng-zorro-antd';
import { RealSessionsRepository, RealTimezonesRepository } from 'real-trading';
import { SessionsRepository, TimezonesRepository } from 'trading';
import { WindowHeaderModule } from 'window-header';
import { SessionManagerComponent } from './session-manager.component';



@NgModule({
  declarations: [SessionManagerComponent],
  imports: [
    CommonModule,
    WindowHeaderModule,
    ScrollingModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzModalModule,
    DataSelectModule,
    TimeSelectModule,
  ],
  exports: [SessionManagerComponent],
  providers: [
    {
      provide: SessionsRepository,
      useClass: RealSessionsRepository,
    },
    {
      provide: TimezonesRepository,
      useClass: RealTimezonesRepository,
    },
  ],
})
export class SessionManagerModule implements LazyModule {
  get components(): ComponentStore {
    return {
      'session-manager': SessionManagerComponent,
    };
  }
}
