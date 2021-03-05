import { Injectable } from '@angular/core';
import { IBaseItem, Repository } from 'communication';
import { IConnection } from '../models';

// extends from IBaseItem only for types compability
export interface VolumeHistoryItem extends IBaseItem {
  price: number;
  volume: number;
}

@Injectable()
export abstract class VolumeHistoryRepository extends Repository<VolumeHistoryItem> {
  abstract forConnection(connection: IConnection);
}
