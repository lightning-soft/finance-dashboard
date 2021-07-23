import { Component, Input } from '@angular/core';
import { SettingsService } from 'settings';
import { ISound } from '../sound.interface';

export enum SoundSetting {
  CONNECTED = 'Connected',
  CONNECTION_LOST = 'Connection Lost',
  ORDER_FILLED = 'Order Filled',
  ORDER_CANCELLED = 'Order Cancelled',
  ORDER_REPLACED = 'Order Replaced',
  ORDER_PENDING = 'Order Pending',
  ORDER_REJECTED = 'Order Rejected',
  TARGET_FILLED = 'Target Filled',
  STOP_FILLED = 'Stop Filled',
  ALERT = 'Alert'
}

@Component({
  selector: 'lib-sound-setting',
  templateUrl: './sound-setting.component.html',
  styleUrls: ['./sound-setting.component.css']
})
export class SoundSettingComponent {
  @Input() checked = false;
  @Input() name: string;
  @Input() selectedSound: string;
  @Input() volume: number;

  constructor(
    private  readonly _settingsService: SettingsService
  ) { }

  formatter(value: number): string {
    return `${value}%`;
  }

  save() {
    const settingsService = this._settingsService;

    const name = this.name;
    const checked = this.checked;
    const selectedSound = this.selectedSound;
    const volume = this.volume;
    const value: ISound = { name, checked, selectedSound, volume };

    switch(name) {
      case SoundSetting.CONNECTED:
        settingsService.saveConnectedSound(value);
        break;
      case SoundSetting.CONNECTION_LOST:
        settingsService.saveConnectionLostSound(value);
        break;
      case SoundSetting.ORDER_FILLED:
        settingsService.saveOrderFilledSound(value);
        break;
      case SoundSetting.ORDER_CANCELLED:
        settingsService.saveOrderCancelledSound(value);
        break;
      case SoundSetting.ORDER_REPLACED:
        settingsService.saveOrderReplacedSound(value);
        break;
      case SoundSetting.ORDER_PENDING:
        settingsService.saveOrderPendingSound(value);
        break;
      case SoundSetting.ORDER_REJECTED:
        settingsService.saveOrderRejectedSound(value);
        break;
      case SoundSetting.TARGET_FILLED:
        settingsService.saveTargetFilledSound(value);
        break;
      case SoundSetting.STOP_FILLED:
        settingsService.saveStopFilledSound(value);
        break;
      case SoundSetting.ALERT:
        settingsService.saveAlertSound(value);
        break;
    }
  }
}
