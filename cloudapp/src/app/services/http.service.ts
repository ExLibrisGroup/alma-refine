import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CloudAppEventsService } from "@exlibris/exl-cloudapp-angular-lib";
import { of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpProxyService {
  private _token: string;

  constructor(
    private events: CloudAppEventsService,
    private http: HttpClient,
  ) { }

  get<T = any>(uri: string, options: { params?: HttpParams, headers?: HttpHeaders } = { params: null, headers: null }) {
    if (!options.headers) options.headers = new HttpHeaders();
    const url = new URL(uri);
    return this.getToken().pipe(
      tap(token => {
        options.headers = options.headers
          .set('Authorization', `Bearer ${token}`)
          .set('X-Proxy-Host', url.hostname);
      }),
      switchMap(() => this.http.get<T>(`${environment.proxy}${url.pathname}`, options)),
    )
  }

  getToken() {
    if (!!this._token) return of(this._token);
    return this.events.getAuthToken().pipe(
      tap(token => this._token = token)
    )
  }
}