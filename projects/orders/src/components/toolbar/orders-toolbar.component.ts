import { Component, Inject } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { DynamicComponentConfig } from 'lazy-modules';

@UntilDestroy()
@Component({
  selector: 'orders-toolbar',
  templateUrl: './orders-toolbar.component.html',
  styleUrls: ['./orders-toolbar.component.scss'],
})
export class OrdersToolbarComponent {

  private _layout: LayoutComponent;

  constructor(@Inject(DynamicComponentConfig) private _config: DynamicComponentConfig) {
    this._layout = _config.data.layout;
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

