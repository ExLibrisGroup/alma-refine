import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RefineService {

  constructor(
    private http: HttpClient
  ) { }

  async callRefineService() {
    console.log('im here in the callRefind service');
    var promise = this.http.get('http://services.getty.edu/vocab/reconcile/?queries={%22q1%22:{%22query%22:%22Laurent,%20Juan,%22,%22type%22:%22ulan%22}}').toPromise();
    promise.then(data => window.alert(data));
  }

}
