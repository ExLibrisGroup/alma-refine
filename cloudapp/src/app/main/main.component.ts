import { Subscription, Observable } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CloudAppEventsService, Entity, PageInfo } from '@exlibris/exl-cloudapp-angular-lib';
import { RefineServiceDef } from '../models/refine-service';
import { ConfigService } from '../services/config.service';
import { Set } from '../models/set';
import { FormControl } from '@angular/forms';
import { SelectSetComponent } from '../select-set/select-set.component';
import { MatSelectChange } from '@angular/material';
import { Router } from '@angular/router';

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
  mmsIds: string[] = [];
  listType: ListType = ListType.SET;
  @ViewChild('selectSet', {static: false}) selectSetComponent: SelectSetComponent;

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
    const entities = (pageInfo.entities||[]).filter(e=>['BIB_MMS', 'IEP', 'IEE'].includes(e.type));
    if (entities.length > 0) {
      this.listType = ListType.DISPLAY;
      this.mmsIds = entities.map(e=>e.id); 
    } else {
      this.listType = ListType.SET;
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
      params['mmsIds'] = this.mmsIds.join(',');
    }
    this.router.navigate(['refine', params]);
  }
}

export enum ListType {
  SET = 'SET',
  DISPLAY = 'DISPLAY'
}