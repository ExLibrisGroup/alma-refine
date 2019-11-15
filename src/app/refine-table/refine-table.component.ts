import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib } from '../models/bib';
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
import { Utils } from '../utilities';

@Component({
  selector: 'app-refine-table',
  templateUrl: './refine-table.component.html',
  styleUrls: ['./refine-table.component.css']
})
export class RefineTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'refine'];
  dataSource: RefineTableDataSource;
  refineServices: Observable<RefineServiceDef[]>;
  previewSize: { height: number, width: number } | {};
  selectedSet: Set;
  recordCount: number;
  isLoading: boolean;
  percentComplete: number;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  serviceSelect = new FormControl('');

  constructor( private bibsService: BibsService, private configService: ConfigService,
    private refineService: RefineService ) { }

  ngOnInit() {
    this.refineServices = this.configService.getRefineServices();
    this.pingProxy();
    this.init();
  }

  pingProxy() { this.configService.ping().then(() => setTimeout(() => this.pingProxy(), 240000))};

  init() {
    /* Subscribe to datasource observables */
    this.dataSource = new RefineTableDataSource(this.bibsService, this.configService, this.refineService);
    this.dataSource.status$.subscribe(result => ({isLoading: this.isLoading, recordCount: this.recordCount, percentComplete: this.percentComplete} = result))
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

  setPreviewSize() {
    let serviceDetails = this.configService.selectedRefineService.serviceDetails;
    this.previewSize = serviceDetails && serviceDetails.preview ? 
      Utils.pick(['height', 'width'])(serviceDetails) : { height: 200, width: 350 };
  }

  onSetSelected(set: Set) {
    this.selectedSet = set;
  }

  load() {
    this.setPreviewSize();
    this.dataSource.loadBibs({ setId: this.selectedSet.id, pageSize: this.paginator.pageSize });
  }

  clear() {
    this.init();
  }

  async save() {
    await this.dataSource.saveRefinements();
    this.clear();
  }

  compareBib(a: Bib, b: Bib): boolean {
    return a && b ? a.mms_id === b.mms_id : a === b;
  }

}
