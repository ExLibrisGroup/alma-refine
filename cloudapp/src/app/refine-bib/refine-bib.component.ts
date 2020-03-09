import { Component, Input, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { RefineField, RefineOption } from '../models/bib';
import { Utils } from '../utilities';

@Component({
  selector: 'app-refine-bib',
  templateUrl: './refine-bib.component.html',
  styleUrls: ['./refine-bib.component.scss'],
  encapsulation: ViewEncapsulation.None /* apply style to injected elements */
})
export class RefineBibComponent  {
  @Input() refinements: RefineField[];
  @Input() previewSize;
  @Output() refinementSelected = new EventEmitter();
  
  constructor() { }

  compareRefineOptions(a: RefineOption, b: RefineOption): boolean {
    return a && b ? a.uri === b.uri : a === b;
  }  

  showPreview(event: MouseEvent, url: string) { 
    setTimeout(()=>{ 
      this.hidePreview();
      const parent = (<Element>event.target).closest(".mat-select-panel");
      let iframe = Utils.dom('iframe', {
        parent: parent,
        className: 'refine-preview-pane',
        attributes: [
          [ 'src', url ], ['frameBorder', '0' ],
          [ 'height', this.previewSize.height || '200' ],
          [ 'width', this.previewSize.width || '350' ],
          [ 'scrolling', 'auto' ]
        ]
      });
      if (parent) parent.parentNode.insertBefore(iframe, parent.nextSibling);
    }, 1000);
  }
  
  hidePreview() { 
    Utils.removeElements( document.querySelectorAll(".refine-preview-pane") );
  }  
}
