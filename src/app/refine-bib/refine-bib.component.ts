import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { Bib, Refinements, RefineField } from '../models/bib';

@Component({
  selector: 'app-refine-bib',
  templateUrl: './refine-bib.component.html',
  styleUrls: ['./refine-bib.component.css']
})
export class RefineBibComponent  {
  @Input() refinements: RefineField[];
  constructor() { }

}
