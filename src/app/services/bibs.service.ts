import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bibs } from '../models/bib';
import { SetMembers } from '../models/set';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BibsService {

  constructor( private httpClient: HttpClient ) { }

  getBibs (mmsIds: string[]): Observable<Bibs> {
    return this.httpClient.get<Bibs>(environment.proxyUrl + '/almaws/v1/bibs',
      { params: new HttpParams()
        .set('mms_id', mmsIds.join(','))
      })
  }

  async getMmsIdsFromSet( setId: string, pageNumber = 0, pageSize = 10 ) {
    return await this.httpClient.get<SetMembers>(environment.proxyUrl + `/almaws/v1/conf/sets/${setId}/members`, 
    { params: new HttpParams()
      .set('limit', pageSize.toString())
      .set('offset', (pageSize*pageNumber+1).toString())
    }).toPromise().then(data=>data.member.map(m=>m.id));
  }
}

  /*
  getSetOfBibs( setId: string, pageNumber = 0, pageSize = 10 ): Observable<Bibs> {
    return this.httpClient.get<SetMembers>(environment.proxyUrl + `/almaws/v1/conf/sets/${setId}/members`, 
      { params: new HttpParams()
        .set('limit', pageSize.toString())
        .set('offset', (pageSize*pageNumber+1).toString())
      }).pipe(
        map(o => { 
          return {
            total_record_count: o.total_record_count, 
            bib: o.member.map( (m): Bib => ({ mms_id: m.id, title: m.description, link: m.link}))
          } as Bibs;
        })
      );    
  }
  */
