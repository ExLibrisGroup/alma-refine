import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Bib } from '../models/bib';
import { BibsService } from '../services/bibs.service';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { RefineTableDataSource, RefineDataSourceStatus } from './refine-table-datasource';
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
  previewSize: { height: number, width: number } | {};
  status: RefineDataSourceStatus;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor( 
    private bibsService: BibsService, 
    public configService: ConfigService,
    private refineService: RefineService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    /* Subscribe to datasource observables */
    this.dataSource = new RefineTableDataSource(this.bibsService, this.configService, this.refineService);
    this.dataSource.status$.subscribe(status => this.status = status)

    this.setId = this.route.snapshot.params['setId'];
    if (this.route.snapshot.params['mmsIds'])
      this.mmsIds = this.route.snapshot.params['mmsIds'].split(',');
    this.setPreviewSize();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.dataSource.loadBibs(
          { 
            pageIndex: this.paginator.pageIndex, 
            pageSize: this.paginator.pageSize
          })
        )
      ).subscribe();
    /* Avoid ExpressionChangedAfterItHasBeenCheckedError error */
    setTimeout( () => this.dataSource.loadBibs({ mmsIds: this.mmsIds, setId: this.setId, pageSize: this.paginator.pageSize }));
  }

  setPreviewSize() {
    let serviceDetails = this.configService.selectedRefineService.serviceDetails;
    this.previewSize = serviceDetails && serviceDetails.preview ? 
      Utils.pick(['height', 'width'])(serviceDetails.preview) : { height: 200, width: 350 };
  }

  async save() {
    let mmsIds = await this.dataSource.saveRefinements();
    this.toastr.success(`Successfully updated ${mmsIds.length} records.`);
    this.router.navigate(['']);
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