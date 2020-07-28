import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sets } from '../models/set';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { merge } from 'lodash';
import { pickDeep } from 'deepdash-es/standalone';
import { RefineServiceDef, defaultRefineServices } from '../models/refine-service';
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
        .pipe(
          map(settings=> {
            if (Object.keys(settings).length==0 || Array.isArray(settings.refineServices)) {
              /* Default or old settings */
              return new Settings()
            } else {
              /* Merge new settings and URLs */
              settings.refineServices = merge(defaultRefineServices, settings.refineServices, pickDeep(defaultRefineServices, ['url']));
              return settings;
            }
          }
          ),
          tap(settings=>this._settings=settings)
        );
    }
  }

  setSettings(val: Settings) {
    this._settings = val;
    this.selectedRefineService = null;
    return this.settingsService.set(val);
  }

  get selectedRefineService(): RefineServiceDef {
    return this._selectedRefineService;
  }

  set selectedRefineService(value: RefineServiceDef) {
    this._selectedRefineService = value;
    if (value != null) this.setServiceDetails().subscribe();
  }

  setServiceDetails() {
    return this.httpClient.get(this._selectedRefineService.url)
    .pipe(
      tap(data=>this._selectedRefineService.serviceDetails=data),
      catchError(e=>{
        console.log('Error retrieving service details', e);
        this._selectedRefineService.serviceDetails={};
        return of({});
      })
    )
  }

  async getSelectedServiceDetails() {
    if (!this._selectedRefineService.serviceDetails) {
      await this.setServiceDetails().toPromise();
    }
    return this._selectedRefineService.serviceDetails;
  }
}
