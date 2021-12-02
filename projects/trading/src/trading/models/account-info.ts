import { Id } from 'communication';

export interface AccountInfo {
  accountBalance: number;
  connectionId: Id;
  closedPnl: number;
  openPnl: number;
  cashOnHand: number;
  position: number;
  buyQty: number;
  sellQty: number;
  id: string;
  name: string;
  currency: string;
  fcmId: string;
  ibId: string;
  lossLimit: number;
  autoLiquidateThreshold: number;
}
