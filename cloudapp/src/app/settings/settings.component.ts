import { Component, OnInit, Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { settingsFormGroup } from './service-utils';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
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
    private settingsService: CloudAppSettingsService,
    private translate: TranslateService,
    private toastr: ToastrService,
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
      this.toastr.success(this.translate.instant('Settings.Saved'));
      this.form.markAsPristine();
      this.saving = false;
    },
    err => this.toastr.error(err.message));
  }

  reset() {
    this.load();
  }

  restore() {
    if (confirm(this.translate.instant('Settings.RestoreConfirm'))) {
      this.form = settingsFormGroup(new Settings());
      this.form.markAsDirty();
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