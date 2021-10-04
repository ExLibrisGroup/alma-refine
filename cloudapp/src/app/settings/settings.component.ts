import { Component, OnInit, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { refineServiceFormGroup, settingsFormGroup } from './service-utils';
import { TranslateService } from '@ngx-translate/core';
import { CanDeactivate } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { DialogService } from 'eca-components';
import { snakeCase, startCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { AddServiceDialog, AddServiceDialogResult } from './add-service-dialog.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  saving = false;

  constructor(
    private translate: TranslateService,
    private alert: AlertService,
    private configService: ConfigService,
    private dialog: DialogService,
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.configService.getSettings().subscribe( (settings: Settings) => {
      this.form = settingsFormGroup(settings);
    });
  }

  save() {
    if (!this.form.valid) return;
    this.saving = true;
    
    this.configService.setSettings(this.form.value).subscribe( () => {
      this.alert.success(this.translate.instant('Settings.Saved'));
      this.form.markAsPristine();
      this.saving = false;
    },
    err => this.alert.error(err.message));
  }

  reset() {
    this.load();
  }

  restore() {
    this.dialog.confirm('Settings.RestoreConfirm')
    .subscribe( result => {
      if (!result) return;
      this.saving = true;
      this.configService.resetSettings().subscribe(()=>{
        this.saving = false;
        this.load();
      });
    })
  }

  addService() {
    this.dialog.prompt(AddServiceDialog, {
      title: 'Settings.Add',
      prompt: 'Settings.Name'
    })
    .subscribe( (result: AddServiceDialogResult ) => {
      if (!result) return;
      const name = snakeCase(result.name);
      if (!name) return;
      if (this.keys.includes(name)) {
        return this.dialog.alert({
          text: ['Settings.Exists', { name: startCase(name) }],
        });
      } 
      this.services.addControl(name, refineServiceFormGroup({
        name: startCase(name),
        url: result.url,
        fields: []
      }))
      this.form.markAsDirty();
    })
  }

  deleteService(key: string) {
    console.log('delete', key);
    this.dialog.confirm({
      text: ['Settings.ConfirmDelete', { name: startCase(this.services.value[key].name) }] 
    })
    .subscribe(result => {
      if (!result) return;
      this.services.removeControl(key);
      this.form.markAsDirty();
    });

  }

  get services() { 
    return this.form.get('refineServices') as FormGroup
  }

  get keys() {
    return Object.keys(this.services.value) 
  }
}


@Injectable({
  providedIn: 'root',
})
export class SettingsGuard implements CanDeactivate<SettingsComponent> {
  constructor(
    private dialog: DialogService
  ) {}

  canDeactivate(component: SettingsComponent): Observable<boolean> {
    if(component.form.dirty) {
      return this.dialog.confirm('Settings.Discard');
    }
    return of(true);
  }
}