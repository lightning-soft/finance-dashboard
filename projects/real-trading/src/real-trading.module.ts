import { ModuleWithProviders, NgModule } from '@angular/core';
import { InstrumentsRepository } from 'trading';
import { RealInstrumentsRepository } from './trading/repositories';

@NgModule({})
export class RealTradingModule {
  static forRoot(): ModuleWithProviders<RealTradingModule> {
    return {
      ngModule: RealTradingModule,
      providers: [
        {
          provide: InstrumentsRepository,
          useClass: RealInstrumentsRepository,
        }
      ]
    };
  }
}
