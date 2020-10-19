import {ScxPositionKind} from './chart';
import {PositionKind} from 'communication';
import {OpenPosition} from '../../trading/models/position';

const PositionKindMap = {};
PositionKindMap[PositionKind.Long] = ScxPositionKind.LONG;
PositionKindMap[PositionKind.Short] = ScxPositionKind.SHORT;

export class ScxPosition {
  static convert(position: OpenPosition) {
    return {
      id: position.id,
      price: position.price,
      kind: PositionKindMap[position.kind],
      quantity: position.lots
    };
  }
}
