import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { Bibs, Bib } from '../models/bib';
import { SetMembers } from '../models/set';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SetOfBibsService {

  constructor(
    private httpClient: HttpClient
  ) { }

  getSetOfBibs( setId: string, pageNumber = 0, pageSize = 10 ): Observable<Bibs> {
    return this.httpClient.get<SetMembers>(environment.proxyUrl + `/almaws/v1/conf/sets/${setId}/members`, 
      { params: new HttpParams()
        .set('limit', pageSize.toString())
        .set('offset', (pageSize*pageNumber+1).toString())
      }).pipe(
        map(o => { 
          return {
            total_record_count: o.total_record_count, 
            bibs: o.member.map( (m): Bib => ({ mmsId: m.id, title: m.description, link: m.link}))
          } as Bibs;
        })
      );    
  }
}
