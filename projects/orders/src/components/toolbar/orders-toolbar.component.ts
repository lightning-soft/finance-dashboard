import { Component, Inject } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { DynamicComponentConfig } from 'lazy-modules';
import { SettingsService } from 'settings';

export type CallbackFn = (event: any) => void;

export type OrdersToolbarConfig = {
  layout: LayoutComponent;
  accountHandler: CallbackFn;
};

@UntilDestroy()
@Component({
  selector: 'orders-toolbar',
  templateUrl: './orders-toolbar.component.html',
  styleUrls: ['./orders-toolbar.component.scss'],
})
export class OrdersToolbarComponent {

  private _layout: LayoutComponent;

  handleAccountChange: CallbackFn;

  constructor(@Inject(DynamicComponentConfig) private _config: DynamicComponentConfig<OrdersToolbarConfig>,
              private _settingsService: SettingsService) {
    this._layout = this._config.data.layout;
    this.handleAccountChange = this._config.data.accountHandler;
  }

  showOrdersForm(): void {
    this._layout.addComponent({
      component: {
        name: 'order-form',
      },
      width: 300,
      height: 390,
    });
  }

  transformAccountLabel(label: string) {
    const replacer = '*';
    const {hideAccountName, hideFromLeft, hideFromRight, digitsToHide} = this._settingsService.settings.getValue()?.general;
    if (hideAccountName) {
      const length = digitsToHide > label.length ? label.length : digitsToHide;
      let _label = label;
      if (hideFromLeft)
        _label = replacer.repeat(length) + _label.substring(length, label.length);
      if (hideFromRight)
        _label = _label.substring(0, label.length - length) + replacer.repeat(length);
      return _label;
    }
    return label;
  }
}

