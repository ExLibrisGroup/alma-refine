import { Component, OnInit, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { settingsFormGroup } from './service-utils';
import { TranslateService } from '@ngx-translate/core';
import { CanDeactivate } from '@angular/router';
import { ConfigService } from '../services/config.service';

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
    private configService: ConfigService
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
    if (confirm(this.translate.instant('Settings.RestoreConfirm'))) {
      this.saving = true;
      this.configService.resetSettings().subscribe(()=>{
        this.saving = false;
        this.load();
      });
    }
  }

  get services() { 
    return this.form.get('refineServices') as FormGroup
  }
}


@Injectable({
  providedIn: 'root',
})
export class SettingsGuard implements CanDeactivate<SettingsComponent> {
  constructor(
    private translate: TranslateService
  ) {}

  canDeactivate(component: SettingsComponent): boolean {
    if(component.form.dirty) {
      return confirm(this.translate.instant('Settings.Discard'));
    }
    return true;
  }
}