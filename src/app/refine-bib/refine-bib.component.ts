import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Bib, Refinements, RefineField, RefineOption } from '../models/bib';
import { MatSelectChange } from '@angular/material';

@Component({
  selector: 'app-refine-bib',
  templateUrl: './refine-bib.component.html',
  styleUrls: ['./refine-bib.component.css']
})
export class RefineBibComponent  {
  @Input() refinements: RefineField[];
  
  constructor() { }

  compareRefineOptions(a: RefineOption, b: RefineOption): boolean {
    return a && b ? a.uri === b.uri : a === b;
  }  
}
