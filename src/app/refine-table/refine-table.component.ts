import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib } from '../models/bib';
import { Set } from '../models/set';
import { SetOfBibsService } from '../services/set-of-bibs.service';
import { merge, of as observableOf, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { RefineService } from '../models/refine-service';
import { MatSelectChange } from '@angular/material';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-refine-table',
  templateUrl: './refine-table.component.html',
  styleUrls: ['./refine-table.component.css']
})
export class RefineTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title'];
  data: Bib[] = [];
  refineServices: Observable<RefineService[]>;

  resultsLength = 0;
  isLoadingResults = false;
  isLoadingError = false;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  serviceSelect = new FormControl('');

  constructor(
    private setOfBibsService: SetOfBibsService,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.refineServices = this.configService.getRefineServices();
  }

  ngAfterViewInit() {
    this.setInitialRefineService();
  }

  setInitialRefineService() {
    this.refineServices
      .subscribe((data) => {
        this.serviceSelect.setValue(data[0]);
        this.configService.selectedRefineService = data[0];
      })
  }

  compareRefineServices(a: RefineService, b: RefineService): boolean {
    return a.url === b.url;
  }

  onRefineServiceSelected(event: MatSelectChange) {
    this.configService.selectedRefineService = event.source.value;
  }

  setSelected(set: Set) {
    this.populateTable(set.id);
  }

  populateTable(setId: string) {
    merge(this.paginator.page)
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.setOfBibsService.getSetOfBibs(setId,
          this.paginator.pageIndex, this.paginator.pageSize);
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.isLoadingError = false;
        this.resultsLength = data.total_record_count;
        return data.bibs;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        this.isLoadingError = true;
        return observableOf([]);
      })
    ).subscribe(data => this.data = data);   
  }

  refine() {
    console.log('in refine');
  }
}
