import { Injectable } from '@angular/core';
import { IInstrument, VolumeData } from 'trading';
import { RealFeed, WSMessageTypes } from './real-feed';
import { RealtimeType } from './realtime';

@Injectable()
export class RealVolumeDatafeed extends RealFeed<VolumeData, IInstrument> {
  type = RealtimeType.VolumePrint;

  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;
}
