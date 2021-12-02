import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountsManager } from './accounts-manager';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private _accountManager: AccountsManager) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(request);

          let errorMessage = '';
          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

            if (error?.error?.error?.message?.includes(`No connection!`)) {
              const connectionId = request.params.get('connectionId');
              this._accountManager.disconnectById(connectionId);
            }
          }

          console.error(errorMessage);

          return throwError(error);
        })
      );
  }
}
