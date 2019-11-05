import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RefineServiceDef, RefineQuery, RefineQueries, RefineResponse } from '../models/refine-service';
import { Refinements } from '../models/bib';
import { Utils } from '../utilities';
import { crc32 } from 'js-crc';

@Injectable({
  providedIn: 'root'
})
export class RefineService {

  constructor(
    private httpClient: HttpClient
  ) { }

  private batchSize:number = 10;

  async callRefineService(refinements: Refinements, refineServiceDef: RefineServiceDef) {
    /* Convert refinements into de-duped list of Refine service queries */
    let queries: RefineQueries = [].concat.apply([],Object.values(refinements)).reduce((a, c) => ({ ...a, [crc32(c.value)]: {query: c.value, limit: 10}}), {});
    /* Call refine service in chunks */ 
    let promises: Array<Promise<RefineResponse>> = Utils.chunk(Object.keys(queries), this.batchSize).map(keys=>{
      let params = new HttpParams().set('queries', JSON.stringify(Utils.pick(keys)(queries)));
      return this.httpClient.get<RefineResponse>(refineServiceDef.url, {params: params}).toPromise();
    });
    let results: RefineResponse = await Promise.all(promises).then(data => Object.assign({},...data));
    /* Update refinements list with results from service */
    Object.values(refinements).forEach(value=>{
      value.forEach((o,i,a) => a[i].refineOptions=results[crc32(o.value)].result.slice(0,10).map(e=>(Object.assign({value:e.name}, this.setUris(refineServiceDef, e.id)))));
    });
    return refinements;
  }

  private setUris(refineServiceDef: RefineServiceDef, id: string) {
    let uri: string, previewUrl: string;
    uri = refineServiceDef.serviceDetails.view &&
            refineServiceDef.serviceDetails.view.url ? 
            refineServiceDef.serviceDetails.view.url.replace(/{{id}}/, id) : id;
    previewUrl = refineServiceDef.serviceDetails.preview &&
      refineServiceDef.serviceDetails.preview.url ? 
      refineServiceDef.serviceDetails.preview.url.replace(/{{id}}/, id) : "";
    return {uri: uri, previewUrl: previewUrl};
  }
}

