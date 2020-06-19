import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fieldFormGroup } from '../service-utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-service-def',
  templateUrl: './service-def.component.html',
  styleUrls: ['./service-def.component.scss'],
})
export class ServiceDefComponent implements OnInit {
  @Input() form: FormGroup;
  indexList: { id: string, name: string }[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.http.get<any>(this.form.value.url)
      .subscribe(result=>this.indexList = result.defaultTypes);
  }

  addField() {
    this.fields.push(fieldFormGroup());
    this.form.updateValueAndValidity();
  }

  removeField(index: number) {
    if (confirm(this.translate.instant('Settings.ServiceDef.RemoveField'))) {
      this.fields.removeAt(index);
      this.form.updateValueAndValidity();
    }
  }

  addSubfield2(event: MatChipInputEvent, field: FormControl) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      field.value.push(value.trim());
      field.markAsDirty();
    }
    if (input) {
      input.value = '';
    }
  }

  removeSubfield2(field: FormControl, val: string) {
    const index = field.value.indexOf(val);

    if (index >= 0) {
      field.value.splice(index, 1);
      field.markAsDirty();
    }
  }

  /* Accessors */
  get serviceUrl() {
    return this.url.pathname;
  }
  set serviceUrl(val) {
    this.form.get('url').setValue(this.url.origin + val.replace(/^\/?/, '/'));
  }
  get url() {
    return new URL(this.form.get('url').value);
  }
  get fields() {
    return this.form.get('fields') as FormArray;
  }
}
