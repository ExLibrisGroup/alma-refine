import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Sets } from '../models/set';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RefineServiceDef } from '../models/refine-service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _selectedRefineService: RefineServiceDef;

  constructor( private httpClient: HttpClient ) {  }

  searchSets(name: string = null, type: string = 'BIB_MMS'): Observable<Sets> {
    let params = new HttpParams().set('content_type', type);
    if (name) params = params.append('q', `name~${name}`);
    return this.httpClient.get<Sets>(environment.proxyUrl + '/almaws/v1/conf/sets', 
      { params: params }
    );
  }

  ping() {
    return this.httpClient.get(environment.proxyUrl + '/almaws/v1/conf/test', { responseType: 'text' }).toPromise();
  }

  getRefineServices(): Observable<RefineServiceDef[]> {
    return this.httpClient.get('./assets/refineServices.json') as Observable<RefineServiceDef[]>;
  }

  get selectedRefineService(): RefineServiceDef {
    return this._selectedRefineService;
  }

  set selectedRefineService(value: RefineServiceDef) {
    this._selectedRefineService = value;
    this._selectedRefineService.serviceDetails = {};
    try {
      this.httpClient.get(this._selectedRefineService.url)
        .subscribe(data=>this._selectedRefineService.serviceDetails=data);
    } catch(e) {  }
  }
}
