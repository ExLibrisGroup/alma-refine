import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CloudAppEventsService } from "@exlibris/exl-cloudapp-angular-lib";
import { of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { environment } from '../../environments/environment';
import { ORCID_URL } from "../models/refine-service";

@Injectable({
  providedIn: 'root'
})
export class HttpProxyService {
  private _token: string;
  private almaHostName: string;

  setAlmaHostName(name) {
    this.almaHostName = name;
  }

  constructor(
    private events: CloudAppEventsService,
    private http: HttpClient,
  ) { }

  get<T = any>(uri: string, options: { params?: HttpParams, headers?: HttpHeaders } = { params: null, headers: null }) {
    if (!options.headers) options.headers = new HttpHeaders();
    let isOrcid = uri === ORCID_URL;
    let host = environment.proxy;
    if (isOrcid) {
      uri = this.almaHostName + uri;
    }
    const url = new URL(uri);
    if (isOrcid) {
      host = this.almaHostName;
      if (host.length > 0 && host.charAt(host.length - 1) === "/"){
        host = host.slice(0, host.length - 1);
      }
    }
    return this.getToken().pipe(
      tap(token => {
        options.headers = options.headers
          .set('Authorization', `Bearer ${token}`)
          .set('X-Proxy-Host', url.hostname);
      }),
      switchMap(() => this.http.get<T>(`${host}${url.pathname}`, options)),
    )
  }

  getToken() {
    if (!!this._token) return of(this._token);
    return this.events.getAuthToken().pipe(
      tap(token => this._token = token)
    )
  }
}