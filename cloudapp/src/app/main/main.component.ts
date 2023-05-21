import { Subscription, forkJoin } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CloudAppEventsService, Entity, PageInfo, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { RefineServiceDef } from '../models/refine-service';
import { ConfigService } from '../services/config.service';
import { Set } from '../models/set';
import { FormControl } from '@angular/forms';
import { SelectSetComponent } from '../select-set/select-set.component';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { SelectEntitiesComponent } from '../select-entities/select-entities.component';
import { RefineService } from '../services/refine.service';
import { HttpProxyService } from '../services/http.service';
import { mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  refineServices: RefineServiceDef[];
  serviceSelect: FormControl;
  selectedSet: Set;
  mmsIds = new Set<string>();
  entities: Entity[];
  listType: ListType = ListType.SET;
  @ViewChild('selectSet', {static: false}) selectSetComponent: SelectSetComponent;
  @ViewChild('selectBibs', {static: false}) selectBibsComponent: SelectEntitiesComponent;

  constructor(
    private eventsService: CloudAppEventsService,
    public configService: ConfigService, private refineService: RefineService,
    private httpService: HttpProxyService, private router: Router
  ) { }

  ngOnInit() {
    this.serviceSelect = new FormControl(this.configService.selectedRefineService);
    this.eventsService.getInitData().pipe(
        tap(res => this.httpService.setAlmaHostName(res.urls.alma) ), 
        mergeMap(_ =>  forkJoin([this.refineService.checkOrcidPermissions(), this.configService.getSettings()])))
    .subscribe(res=> {
      const hasOrcidPermission = res[0];
      const settings = res[1];
      this.refineServices=Object.entries(settings.refineServices).filter(([key, value]) => {
        // check permissions
        if (key === `orcid`) {
          return hasOrcidPermission
        }
        return true;
    }).map(([key, value]) => value)});
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.entities = (pageInfo.entities||[]).filter(e=>[EntityType.BIB_MMS, 'BIB', 'IEP'].includes(e.type));
    if (this.entities.length == 0) {
      this.listType = ListType.SET;
    } else if (this.listType == ListType.SET) {
      this.listType = ListType.DISPLAY;
    }
  }

  compareRefineServices(a: RefineServiceDef, b: RefineServiceDef): boolean {
    return a && b ? a.url === b.url : a === b;
  }

  onRefineServiceSelected(event: MatSelectChange) {
    this.configService.selectedRefineService = event.source.value;
  }

  onSetSelected(set: Set) {
    this.selectedSet = set;
  }

  load() {
    const params = { };
    if (this.listType == ListType.SET) {
      params['setId'] = this.selectedSet.id
    } else {
      if (this.listType == ListType.DISPLAY) {
        this.mmsIds.clear();
        this.entities.map(e=>e.id).forEach(this.mmsIds.add, this.mmsIds);
      }
      params['mmsIds'] = Array.from(this.mmsIds).join(',');
    }
    this.router.navigate(['refine', params]);
  }

  onBibSelected(event) {
    if (event.checked) this.mmsIds.add(event.mmsId);
    else this.mmsIds.delete(event.mmsId);
  }

  get isValid() {
    return (
      ( (this.listType==ListType.SET && this.selectedSet!=null) ||
        (this.listType==ListType.SELECT && this.mmsIds.size!=0) || 
        (this.listType=='DISPLAY') 
      ) &&
      this.configService.selectedRefineService!=null
    );
  }
}

export enum ListType {
  SET = 'SET',
  DISPLAY = 'DISPLAY',
  SELECT = 'SELECT'
}