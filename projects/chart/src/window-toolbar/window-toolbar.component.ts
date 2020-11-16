import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { Broker } from 'trading';

@UntilDestroy()
@Component({
  selector: 'app-window-toolbar',
  templateUrl: './window-toolbar.component.html',
  styleUrls: ['./window-toolbar.component.scss']
})
export class WindowToolbarComponent implements OnInit {

  broker: Broker;
  Broker = Broker;

  constructor(private _accountsManager: AccountsManager) {}

  ngOnInit() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();

        this.broker = connection?.broker;
      });
  }
}
