import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib, RefineField } from '../models/bib';
import { Set } from '../models/set';
import { BibsService } from '../services/bibs.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { RefineServiceDef } from '../models/refine-service';
import { MatSelectChange  } from '@angular/material';
import { FormControl } from '@angular/forms';
import { RefineTableDataSource } from './refine-table-datasource';
import { RefineService } from '../services/refine.service';

@Component({
  selector: 'app-refine-table',
  templateUrl: './refine-table.component.html',
  styleUrls: ['./refine-table.component.css']
})
export class RefineTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'refine'];
  dataSource: RefineTableDataSource = new RefineTableDataSource(this.bibsService, this.configService, this.refineService);
  refineServices: Observable<RefineServiceDef[]>;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  serviceSelect = new FormControl('');

  constructor( private bibsService: BibsService, private configService: ConfigService,
    private refineService: RefineService ) { }

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

  compareRefineServices(a: RefineServiceDef, b: RefineServiceDef): boolean {
    return a.url === b.url;
  }

  onRefineServiceSelected(event: MatSelectChange) {
    this.configService.selectedRefineService = event.source.value;
  }

  onSetSelected(set: Set) {
    this.dataSource.loadBibs({setId: set.id});
  }

  async save() {
    let data = this.dataSource.saveRefinements();
  }

  compareBib(a: Bib, b: Bib): boolean {
    return a && b ? a.mms_id === b.mms_id : a === b;
  }

}
