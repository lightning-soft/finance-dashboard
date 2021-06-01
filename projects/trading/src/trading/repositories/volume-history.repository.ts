import { Injectable } from '@angular/core';
import { IBaseItem, Repository } from 'communication';

// extends from IBaseItem only for types compability
export interface VolumeHistoryItem extends IBaseItem {
  price: number;
  volume: number;
}

@Injectable()
export abstract class VolumeHistoryRepository extends Repository<VolumeHistoryItem> {
}
