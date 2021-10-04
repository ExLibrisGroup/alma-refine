import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fieldFormGroup } from '../service-utils';
import { TranslateService } from '@ngx-translate/core';
import { HttpProxyService } from '../../services/http.service';
import { DialogService } from 'eca-components';

@Component({
  selector: 'app-settings-service-def',
  templateUrl: './service-def.component.html',
  styleUrls: ['./service-def.component.scss'],
})
export class ServiceDefComponent implements OnInit {
  @Input() form: FormGroup;
  @Output() onDelete = new EventEmitter();
  indexList: { id: string, name: string }[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private http: HttpProxyService,
    private translate: TranslateService,
    private dialog: DialogService,
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
    this.dialog.confirm('Settings.ServiceDef.RemoveField')
    .subscribe( result => {
      if (!result) return;
      this.fields.removeAt(index);
      this.form.updateValueAndValidity();
      this.form.markAsDirty();
    });
  }

  addChip(event: MatChipInputEvent, field: FormControl) {
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

  removeChip(field: FormControl, val: string) {
    const index = field.value.indexOf(val);

    if (index >= 0) {
      field.value.splice(index, 1);
      field.markAsDirty();
    }
  }

  deleteService() {
    this.onDelete.emit();
  }

  /* Accessors */
  get fields() {
    return this.form.get('fields') as FormArray;
  }
}
