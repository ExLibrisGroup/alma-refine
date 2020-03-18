import { Subscription, Observable } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CloudAppEventsService, Entity, PageInfo, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { RefineServiceDef } from '../models/refine-service';
import { ConfigService } from '../services/config.service';
import { Set } from '../models/set';
import { FormControl } from '@angular/forms';
import { SelectSetComponent } from '../select-set/select-set.component';
import { MatSelectChange } from '@angular/material';
import { Router } from '@angular/router';
import { SelectEntitiesComponent } from '../select-entities/select-entities.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  refineServices: Observable<RefineServiceDef[]>;
  serviceSelect: FormControl;
  selectedSet: Set;
  mmsIds = new Set<string>();
  entities: Entity[];
  listType: ListType = ListType.SET;
  @ViewChild('selectSet', {static: false}) selectSetComponent: SelectSetComponent;
  @ViewChild('selectBibs', {static: false}) selectBibsComponent: SelectEntitiesComponent;

  constructor(
    private eventsService: CloudAppEventsService,
    public configService: ConfigService,
    private router: Router
  ) { }

  ngOnInit() {
    this.serviceSelect = new FormControl(this.configService.selectedRefineService);
    this.refineServices = this.configService.getRefineServices();
    this.eventsService.getPageMetadata().subscribe(this.onPageLoad);
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  setInitialRefineService() {
    this.refineServices
      .subscribe((data) => {
        this.serviceSelect.setValue(data[0]);
        this.configService.selectedRefineService = data[0];
      })
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.entities = (pageInfo.entities||[]).filter(e=>[EntityType.BIB_MMS, 'BIB', 'IEP'].includes(e.type));
    if (this.entities.length == 0) {
      this.listType = ListType.SET;
    } else if (this.listType == ListType.SET) {
      this.listType = ListType.DISPLAY;
    }
  }

  clear() {
    this.serviceSelect.reset();
    this.selectSetComponent.formControl.reset();
    this.configService.selectedRefineService = null;
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
}

export enum ListType {
  SET = 'SET',
  DISPLAY = 'DISPLAY',
  SELECT = 'SELECT'
}