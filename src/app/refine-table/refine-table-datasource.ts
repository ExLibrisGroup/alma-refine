import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { Bib, Bibs } from '../models/bib';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SetOfBibsService } from '../services/set-of-bibs.service';
import { catchError, finalize } from 'rxjs/operators';

export class RefineTableDataSource implements DataSource<Bib> {

  private bibsSubject = new BehaviorSubject<Bib[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private recordCountSubject = new BehaviorSubject<number>(0);
  private _setId: string;

  public isLoading = this.loadingSubject.asObservable();
  public recordCount = this.recordCountSubject.asObservable();

  constructor(private setOfBibsService: SetOfBibsService) {}

  connect(collectionViewer: CollectionViewer): Observable<Bib[]> {
    return this.bibsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.bibsSubject.complete();
    this.loadingSubject.complete();
    this.recordCountSubject.complete();
  }

  loadBibs( { setId = this._setId, pageIndex = 0, pageSize = 10 } = {} ) {
    this._setId = setId;
    this.loadingSubject.next(true);
    this.setOfBibsService.getSetOfBibs(setId, pageIndex, pageSize)
      .pipe(
        catchError(() => of (<Bibs>{})),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(bibs=>{
        this.bibsSubject.next(bibs.bibs);
        this.recordCountSubject.next(bibs.total_record_count)
      });
  }
}