import { Indicator } from './Indicator';
import { volumeBreakdownConfig } from '../fields';

export class VolumeBreakdown extends Indicator {
  name = 'Volume Breakdown';
  config = volumeBreakdownConfig;

  protected _mapGetSettings(settings: any) {
    return {
      colors: {
        downColor: null,
        downcoloroutline: null,
        upColor: null,
        upcoloroutline: null,
      },
      delta: {
        averageDelta: false,
        averagePeriod: 2,
        invertDelta: false,
        resetMode: 'DeltaMomentum',
        showBars: 1,
        showCandles: false,
        type: 'hybrid',
      },
      filter: {
        size: 2,
        type: 'GreaterOrEqualTo',
      },
      optimization: {
        workLastBars: 3
      },
      setup: {
        calculate: 'onEachTick',
      }
    };
  }
}
