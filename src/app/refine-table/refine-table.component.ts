import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib } from '../models/bib';
import { Set } from '../models/set';
import { BibsService } from '../services/bibs.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  displayedColumns: string[] = ['id', 'title', 'refine'];
  expandedBib: Bib | null;
  dataSource: RefineTableDataSource = new RefineTableDataSource(this.bibsService, this.configService);
  refineServices: Observable<RefineService[]>;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  serviceSelect = new FormControl('');

  constructor(
    private bibsService: BibsService,
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

  async refine() {
    console.log('in refine');
    //console.log('currentlyDisplayedBibs', this.dataSource.currentlyDisplayedBibs);
    //let bibs = await this.bibsService.getBibs(this.dataSource.currentlyDisplayedBibs.map(bib=>bib.mms_id));
    //console.log('refine', bibs);
  }

  compareBib(a: Bib, b: Bib): boolean {
    return a && b ? a.mms_id === b.mms_id : a === b;
  }

}
