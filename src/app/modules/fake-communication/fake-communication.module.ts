import { NgModule, ModuleWithProviders, NgZone } from '@angular/core';
import { InstrumentsRepository, Datafeed } from '../communication';
import { FakeInstrumentsRepository, FakeDatafeed } from './trading';

@NgModule({})
export class FakeCommunicationModule {
    static forRoot(): ModuleWithProviders<FakeCommunicationModule> {
        return {
            ngModule: FakeCommunicationModule,
            providers: [
                {
                    provide: InstrumentsRepository,
                    useClass: FakeInstrumentsRepository,
                },
                {
                    provide: Datafeed,
                    useClass: FakeDatafeed,
                    deps: [NgZone],
                },
            ]
        };
    }
}
