import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib } from '../models/bib';
import { BibsService } from '../services/bibs.service';
import { ConfigService } from '../services/config.service';
import { RefineTableDataSource } from './refine-table-datasource';
import { RefineService } from '../services/refine.service';
import { Utils } from '../utilities';
import { ActivatedRoute, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-refine-table',
  templateUrl: './refine-table.component.html',
  styleUrls: ['./refine-table.component.scss']
})
export class RefineTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'refine'];
  dataSource: RefineTableDataSource;
  setId: string;
  mmsIds: string[];
  previewSize: { height: number, width: number };
  status = { isLoading: false, recordCount: 0, percentComplete: -1 };

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor( 
    private bibsService: BibsService, 
    public configService: ConfigService,
    private refineService: RefineService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    this.setId = this.route.snapshot.params['setId'];
    if (this.route.snapshot.params['mmsIds'])
      this.mmsIds = this.route.snapshot.params['mmsIds'].split(',');
    await this.setPreviewSize();
    this.dataSource = new RefineTableDataSource(this.bibsService, this.configService, this.refineService,
      this.mmsIds, this.setId);
    this.page();
  }

  ngOnDestroy() {
    this.dataSource = null;
  }

  ngAfterViewInit() {
    /* Avoid ExpressionChangedAfterItHasBeenCheckedError error */
    setTimeout(()=>this.page());
  }

  page() {
    if (this.dataSource) {
      this.status.isLoading = true;
      this.dataSource.loadBibs({ pageSize: this.paginator.pageSize, pageIndex: this.paginator.pageIndex })
        .subscribe({ complete: () => this.status.isLoading = false });
    }
  }

  get totalRecords() {
    return this.dataSource 
      ? this.dataSource.recordCount
      : 0;
  }

  async setPreviewSize() {
    this.status.isLoading = true;
    let serviceDetails = await this.configService.getSelectedServiceDetails();
    this.previewSize = serviceDetails && serviceDetails.preview ? 
      Utils.pick(['height', 'width'])(serviceDetails.preview) : { height: 200, width: 350 };
    this.status.isLoading = false;
  }

  save() {
    let mmsIds = [];
    this.status = { isLoading: true, recordCount: Object.keys(this.dataSource.updates).length, percentComplete: 0 };
    this.dataSource.saveRefinements().subscribe( {
      next: resp => {
        mmsIds.push(resp);
        this.status.percentComplete = Math.round((mmsIds.length/this.status.recordCount)*100);
      },
      complete: () => {
        console.log('Updated', mmsIds.join(','));
        setTimeout(() => {
          this.status = { isLoading: false, percentComplete: -1, recordCount: 0 };
          this.toastr.success(`Successfully updated ${mmsIds.length} records.`);
          this.router.navigate(['']);  
        }, 1000)

      }
    })
  }

  compareBib(a: Bib, b: Bib): boolean {
    return a && b ? a.mms_id === b.mms_id : a === b;
  }

}

@Injectable({
  providedIn: 'root',
})
export class RefineTableGuard implements CanActivate {
  constructor(
    public configService: ConfigService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (!this.configService.selectedRefineService || (!next.params['setId'] && !next.params['mmsIds'])) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}