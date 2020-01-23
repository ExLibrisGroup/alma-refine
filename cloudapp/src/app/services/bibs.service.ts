import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bibs, Bib } from '../models/bib';
import { SetMembers } from '../models/set';
import { CloudAppRestService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root'
})
export class BibsService {

  constructor( private restService: CloudAppRestService ) { }

  /** Retrieve BIB objects for specified MMS_IDs */
  getBibs (mmsIds: string[]): Observable<Bibs> {
    const params = { 'mms_id': mmsIds.join(',') }
    return this.restService.call( {
      url: '/bibs',
      queryParams: params
    }).pipe(map( results => results as Bibs ))
  }

  /** Retrieve MMS_IDs from set of BIBs */
  getMmsIdsFromSet( setId: string, pageNumber = 0, pageSize = 10 ): Observable<SetMembers> {
    const params = { 
      limit: pageSize.toString(),
      offset: (pageSize*pageNumber).toString() 
    }
    return this.restService.call( {
      url: `/conf/sets/${setId}/members`,
      queryParams: params
    }).pipe(map( results => results as SetMembers ))
  }

  /** Create a new BIB record with the specified MARCXML */
  createBib( bib: Bib ) {
    return this.restService.call( {
      url: '/bibs',
      headers: { 
        "Content-Type": "application/xml",
        Accept: "application/json" },
      requestBody: `<bib>${bib.anies}</bib>`,
      method: HttpMethod.POST
    })
  }
  
  /** Update a BIB record with the specified MARCXML */
  updateBib( bib: Bib ) {
    return this.restService.call( {
      url: `/bibs/${bib.mms_id}`,
      headers: { 
        "Content-Type": "application/xml",
        Accept: "application/json" },
      requestBody: `<bib>${bib.anies}</bib>`,
      method: HttpMethod.PUT
    })    
  }

  /** Retrieve a single BIB record */
  getBib (mmsId: string): Observable<Bib> {
    return this.restService.call(`/almaws/v1/bibs/${mmsId}`)
      .pipe(map( results => results as Bib ));
  }   

}

