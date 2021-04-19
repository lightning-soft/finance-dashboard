import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'auth';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  @Output() handleToggleDropdown = new EventEmitter<boolean>();

  isAuthenticated: boolean;
  userName: string;
  loginLink: string;
  visible = false;

  constructor(
    private _authService: AuthService,
    private _appConfig: AppConfig
  ) { }

  ngOnInit(): void {
    this._authService.isAuthorizedChange
      .subscribe((res: boolean) => {
        this.isAuthenticated = res;

        if (this.isAuthenticated)
          this.userName = this._authService.userInfo.name;
        else
          this.loginLink = this.generateLoginLink(this._appConfig.identity);
      });
  }

  logout(): void {
    this._authService.logOutWithRedirect();
    // this._authService.logOut()
    //   .subscribe(
    //     (res) => console.log(res),
    //     (e) => console.error(e)
    //   );
    // this.visible = false;
  }

  changeName(): void {
    console.log('Todo -> change name logic');
    this.visible = false;
  }

  private generateLoginLink(config): string {

    const { clientId, responseType, scope, redirectUri } = config;

    const data = new URLSearchParams();

    data.set('client_id', clientId);
    data.set('response_type', responseType);
    data.set('scope', scope.join(' '));
    data.set('redirect_uri', redirectUri);

    return `${config.url}connect/authorize?${data.toString()}`;
  }

}
