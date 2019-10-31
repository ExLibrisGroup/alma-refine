import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RefineServiceDef } from '../models/refine-service';
import { Refinements } from '../models/bib';
import { chunk, pick } from '../utilities';

@Injectable({
  providedIn: 'root'
})
export class RefineService {

  constructor(
    private httpClient: HttpClient
  ) { }

  private batchSize:number = 10;
  private refineServiceDef: RefineServiceDef;

  async callRefineService(refinements: Refinements, refineServiceDef: RefineServiceDef) {
    let queries = [].concat.apply([],Object.values(refinements)).reduce((a, c) => ({ ...a, [escape(c.value)]: {query: c.value, limit: 10}}), {});
    let promises: Array<Promise<Refinements>> = chunk(Object.keys(queries), this.batchSize).map(keys=>{
      let params = new HttpParams().set('queries', JSON.stringify(pick(keys)(queries)));
      return this.httpClient.get(refineServiceDef.url, {params: params}).toPromise();
    });
    let results = await Promise.all(promises).then(data => Object.assign({},...data));
    Object.entries(refinements).forEach(([key,value])=>{
      value.forEach((o,i,a) => a[i].refineOptions=results[escape(o.value)].result.slice(0,10).map(e=>(Object.assign({value:e.name}, this.setUri(refineServiceDef, e.id)))));
    });
    return refinements;
  }

  private setUri(refineServiceDef: RefineServiceDef, id: string) {
    let uri, previewUrl;
    uri = refineServiceDef.serviceDetails.view &&
            refineServiceDef.serviceDetails.view.url ? 
            refineServiceDef.serviceDetails.view.url.replace(/{{id}}/, id) : id;
    previewUrl = refineServiceDef.serviceDetails.preview &&
      refineServiceDef.serviceDetails.preview.url ? 
      refineServiceDef.serviceDetails.preview.url.replace(/http:\/\//, 'https://').replace(/{{id}}/, id) : "";
    return {uri: uri, previewUrl: previewUrl};
  }
}

