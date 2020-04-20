import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sets } from '../models/set';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RefineServiceDef } from '../models/refine-service';
import { CloudAppRestService, CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _selectedRefineService: RefineServiceDef;
  private _settings: Settings;

  constructor( 
    private httpClient: HttpClient,
    private restService: CloudAppRestService,
    private settingsService: CloudAppSettingsService
  ) {  }

  searchSets(name: string = null, type: string = 'BIB_MMS'): Observable<Sets> {
    let params = { 'content_type': type }
    if (name) params['q'] = `name~${name}`;
    return this.restService.call( {
      url: '/conf/sets',
      queryParams: params
    }).pipe(map( results => results as Sets))
  }

  /** Retrieve settings  */
  getSettings(): Observable<Settings> {
    if (this._settings) {
      return of(this._settings);
    } else {
      return this.settingsService.get()
        .pipe(tap(settings=>this._settings=settings));
    }
  }

  setSettings(val: Settings) {
    this._settings = val;
  }

  get selectedRefineService(): RefineServiceDef {
    return this._selectedRefineService;
  }

  set selectedRefineService(value: RefineServiceDef) {
    this._selectedRefineService = value;
    if (value) {
      try {
        this.httpClient.get(this._selectedRefineService.url)
          .subscribe(data=>this._selectedRefineService.serviceDetails=data);
      } catch(e) {  }
    }
  }
}
