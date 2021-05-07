import { RealFeed, WSMessageTypes } from './real-feed';
import { IInstrument, VolumeData } from 'trading';
import { RealtimeType } from './realtime';

export class RealVolumeDatafeed extends RealFeed<VolumeData, IInstrument> {
  type = RealtimeType.VolumePrint;

  subscribeType = WSMessageTypes.SUBSCRIBE;
  unsubscribeType = WSMessageTypes.UNSUBSCRIBE;
}
