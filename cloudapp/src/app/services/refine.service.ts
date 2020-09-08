import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RefineServiceDef, RefineQueries, RefineResponse } from '../models/refine-service';
import { Refinements } from '../models/bib';
import { Utils } from '../utilities';
import * as crc from 'js-crc';
import { from } from 'rxjs';
import { mergeMap, toArray, map } from 'rxjs/operators';

const BATCH_SIZE = 10;
const MAX_CONCURRENCY = 5;

@Injectable({
  providedIn: 'root'
})
export class RefineService {

  constructor( private httpClient: HttpClient ) { }

  /** Calls refine service to query specified terms */
  callRefineService(refinements: Refinements, refineServiceDef: RefineServiceDef) {
    /* Convert refinements into de-duped list of Refine service queries */
    let queries: RefineQueries = [].concat.apply([],Object.values(refinements)).reduce((a, c) => {
      let q = {query: c.value, limit: 10};
      /* Add type query if defined */
      if (Array.isArray(c.indexes) && c.indexes.length > 0) {
        q['type'] = c.indexes.length == 1 ? c.indexes[0] : c.indexes;
      }
      return ({ ...a, [crc.crc32(c.value)]:  q})
    }, {});
    /* Call refine service in chunks */
    return from(Utils.chunk(Object.keys(queries), BATCH_SIZE)).pipe(
      mergeMap(keys=>this.httpClient.get<RefineResponse>(refineServiceDef.url, 
        { params: new HttpParams().set('queries', JSON.stringify(Utils.pick(keys)(queries)))}
      ), MAX_CONCURRENCY),
      toArray(),
      map(data => {
        let results = Utils.combine(data);
        /* Update refinements list with results from service */        
        Object.values(refinements).forEach(value=>{
          value.forEach((o,i,a) => {
            a[i].refineOptions=results[crc.crc32(o.value)].result.slice(0,10).map(e=>(Object.assign({value:e.name}, this.setUris(refineServiceDef, e.id))))
            if (a[i].selectedRefineOption) a[i].selectedRefineOption=a[i].refineOptions.find(o=>o.uri===a[i].selectedRefineOption.uri);
          });
        });
        return refinements;
      })
    )
  }

  private setUris(refineServiceDef: RefineServiceDef, id: string) {
    let uri: string, previewUrl: string;
    uri = (refineServiceDef.prefix || '') + id;
    previewUrl = refineServiceDef.serviceDetails.preview &&
      refineServiceDef.serviceDetails.preview.url ? 
      refineServiceDef.serviceDetails.preview.url.replace(/{{id}}/, id) : "";
    return {uri: uri, previewUrl: previewUrl};
  }

}
