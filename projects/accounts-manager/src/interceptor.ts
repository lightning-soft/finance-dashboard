import {
  HttpErrorResponse, HttpEvent,
  HttpHandler, HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class HttpErrorInterceptor implements HttpInterceptor {
  disconnectError = new Subject();

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

            if (error?.error?.error?.message == `No connection!`)
              this.disconnectError.next();
          }

          console.error(errorMessage);

          return throwError(error);
        })
      )
  }
}
