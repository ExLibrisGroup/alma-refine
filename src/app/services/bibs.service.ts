import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bibs, Bib } from '../models/bib';
import { SetMembers } from '../models/set';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BibsService {

  constructor( private httpClient: HttpClient ) { }

  /** Retrieve BIB objects for specified MMS_IDs */
  getBibs (mmsIds: string[]): Observable<Bibs> {
    return this.httpClient.get<Bibs>(environment.proxyUrl + '/almaws/v1/bibs',
      { params: new HttpParams()
        .set('mms_id', mmsIds.join(','))
      })
  }

  /** Retrieve MMS_IDs from set of BIBs */
  getMmsIdsFromSet( setId: string, pageNumber = 0, pageSize = 10 ): Observable<SetMembers> {
    return this.httpClient.get<SetMembers>(environment.proxyUrl + `/almaws/v1/conf/sets/${setId}/members`, 
    { params: new HttpParams()
      .set('limit', pageSize.toString())
      .set('offset', (pageSize*pageNumber).toString())
    });
  }

  /** Create a new BIB record with the specified MARCXML */
  createBib( bib: Bib ) {
    return this.httpClient.post<Bib>(environment.proxyUrl + '/almaws/v1/bibs',
      `<bib>${bib.anies}</bib>`, 
      { headers: new HttpHeaders().set('Content-type', 'application/xml') } );
  }
  
  /** Update a BIB record with the specified MARCXML */
  updateBib( bib: Bib ) {
    return this.httpClient.put<Bib>(environment.proxyUrl + `/almaws/v1/bibs/${bib.mms_id}`,
      `<bib>${bib.anies}</bib>`, 
      { headers: new HttpHeaders().set('Content-type', 'application/xml') });
   }

   /** Retrieve a single BIB record */
   getBib (mmsId: string) {
    return this.httpClient.get<Bib>(environment.proxyUrl + `/almaws/v1/bibs/${mmsId}`)
  }   

}

