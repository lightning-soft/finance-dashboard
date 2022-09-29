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

  transformAccountLabel(item: string): string {
    return this._settingsService.transformAccountLabel(item);
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
}

