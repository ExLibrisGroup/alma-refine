import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Sets } from '../models/set';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RefineServiceDef } from '../models/refine-service';
import { CloudAppRestService, Request } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _selectedRefineService: RefineServiceDef;

  constructor( private httpClient: HttpClient,
    private restService: CloudAppRestService 
  ) {  }

  searchSets(name: string = null, type: string = 'BIB_MMS'): Observable<Sets> {
    let params = { 'content_type': type }
    if (name) params['q'] = `name~${name}`;
    return this.restService.call( {
      url: '/conf/sets',
      queryParams: params
    }).pipe(map( results => results as Sets))
  }

  /** Retrieve refine services from config file */
  getRefineServices(): Observable<RefineServiceDef[]> {
    return this.httpClient.get('./assets/refineServices.json') as Observable<RefineServiceDef[]>;
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
