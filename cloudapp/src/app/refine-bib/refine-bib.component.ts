import { Component, Input, ViewEncapsulation, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { RefineField, RefineOption } from '../models/bib';
import { NgxTippyProps } from 'ngx-tippy-wrapper';
import { delegate } from 'tippy.js'

@Component({
  selector: 'app-refine-bib',
  templateUrl: './refine-bib.component.html',
  styleUrls: ['./refine-bib.component.scss'],
  encapsulation: ViewEncapsulation.None /* apply style to injected elements */
})
export class RefineBibComponent  {
  @Input() refinements: RefineField[];
  @Input() previewSize;
  @ViewChild('previewFrame', {static: false}) 
  previewFrame: ElementRef;

  @Output() refinementSelected = new EventEmitter();
  
  tippyProps: NgxTippyProps = {
    content: reference => {
      const frame = document.getElementById('previewFrame') as HTMLIFrameElement;
      let url = reference.getAttribute('data-preview-url');
      if (url && frame) {
        frame.src = url;
        return frame.outerHTML;
      }
      return null;
    },
    delay: [750, null],
    allowHTML: true,
    theme: 'light',
    interactive: true,
    maxWidth: 400,
    appendTo: reference => reference.closest('.mat-select-panel-wrap'),
    placement: 'left',

  };
  
  constructor() { }

  compareRefineOptions(a: RefineOption, b: RefineOption): boolean {
    return a && b ? a.uri === b.uri : a === b;
  }  

  ngAfterViewInit() {
    this.previewFrame.nativeElement.height = this.previewSize.height;
    this.previewFrame.nativeElement.width = this.previewSize.width;
    delegate('body', Object.assign(this.tippyProps, { target: '[data-preview-url]'}));
  }
}
