import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { Entity } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-select-entities',
  templateUrl: './select-entities.component.html',
  styleUrls: ['./select-entities.component.scss']
})
export class SelectEntitiesComponent implements OnInit {
  masterChecked: boolean;
  masterIndeterminate: boolean;
  entities: SelectItem[];
  @Input() selectedEntities: Set<string>;
  @Output() entitySelected = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.masterChecked = false;
  }

  @Input()
  set entityList(val: Entity[]) {
    this.entities = val.map(i=>new SelectItem(i, id => this.selectedEntities.has(id)));
    this.determineMasterValue();
  }

  masterChange() {
    Object.values(this.entities).forEach(b=>{
      b.checked = this.masterChecked;
      this.entitySelected.emit({mmsId: b.id, checked: b.checked})
    })
  }

  listChange(e: MatCheckboxChange){
    this.determineMasterValue();
    this.entitySelected.emit({mmsId: e.source.value, checked: e.checked});
  }

  determineMasterValue() {
    const checked_count = Object.values(this.entities).filter(i=>i.checked).length;
    this.masterChecked = checked_count == this.entities.length;
    this.masterIndeterminate = checked_count > 0 && checked_count < this.entities.length;
  }
}

export class SelectItem {
  checked: boolean;
  id: string;
  name: string;

  constructor(item: Partial<SelectItem>, checker: (id: string) => boolean) {
    Object.assign(this, item);
    this.checked = checker(item.id);
  }
}