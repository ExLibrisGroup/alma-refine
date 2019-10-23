import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib } from '../models/bib';
import { Set } from '../models/set';
import { SetOfBibsService } from '../services/set-of-bibs.service';
import { merge, of as observableOf, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { RefineService } from '../models/refine-service';
import { MatSelectChange } from '@angular/material';
import { FormControl } from '@angular/forms';
import { RefineTableDataSource } from './refine-table-datasource';

@Component({
  selector: 'app-refine-table',
  templateUrl: './refine-table.component.html',
  styleUrls: ['./refine-table.component.css']
})
export class RefineTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title'];
  dataSource: RefineTableDataSource = new RefineTableDataSource(this.setOfBibsService);
  refineServices: Observable<RefineService[]>;

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
    this.paginator.page
      .pipe(
        tap(() => this.dataSource.loadBibs(
          { pageIndex: this.paginator.pageIndex, 
            pageSize: this.paginator.pageSize
          })
        )
      ).subscribe();
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
    this.dataSource.loadBibs({setId: set.id});
  }

  refine() {
    console.log('in refine');
  }
}
