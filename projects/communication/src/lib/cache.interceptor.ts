import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cachedRequests = new Map<string, Observable<HttpEvent<any>>>();

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    const apiKey = req.headers.get('Api-Key') ?? '';
    const key = [req.urlWithParams, req.responseType, apiKey].join('-');

    if (!this.cachedRequests.has(key)) {
      this.cachedRequests.set(key, next.handle(req).pipe(
        finalize(() => this.cachedRequests.delete(key)),
        shareReplay({ refCount: true, bufferSize: 1 }),
      ));
    }

    return this.cachedRequests.get(key);
  }
}
