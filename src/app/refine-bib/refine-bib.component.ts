import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Bib, Refinements, RefineField, RefineOption } from '../models/bib';
import { MatSelectChange } from '@angular/material';
import { removeElements } from '../utilities';

@Component({
  selector: 'app-refine-bib',
  templateUrl: './refine-bib.component.html',
  styleUrls: ['./refine-bib.component.css'],
  encapsulation: ViewEncapsulation.None /* apply style to injected elements */
})
export class RefineBibComponent  {
  @Input() refinements: RefineField[];
  @Input() previewSize;
  
  constructor() { }

  compareRefineOptions(a: RefineOption, b: RefineOption): boolean {
    return a && b ? a.uri === b.uri : a === b;
  }  

  showPreview(event, url: string) { 
    setTimeout(()=>{ 
      const elem = event.fromElement.closest(".mat-select-panel")
      let iframe = document.createElement('iframe');
      elem.parentNode.insertBefore(iframe, elem.nextSibling);
      iframe.src = url;
      iframe.className = 'refine-preview-pane';
      iframe.frameBorder = '0';
      iframe.height = this.previewSize.height || '200';
      iframe.width = this.previewSize.width || '350';
    }, 1000);
  }
  
  hidePreview() { 
    removeElements( document.querySelectorAll(".refine-preview-pane") );
  }  
}
