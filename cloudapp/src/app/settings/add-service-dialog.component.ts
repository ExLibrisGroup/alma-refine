import { ElementRef, Inject, ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { PromptDialog, PromptDialogData  } from "eca-components";

export interface AddServiceDialogResult {
  name: string;
  url: string;
}
@Component({
  selector: 'add-service-dialog',
  templateUrl: './add-service-dialog.component.html',
  styles: [ '.mat-form-field { display: block; }' ]
})
export class AddServiceDialog extends PromptDialog {
  @ViewChild('input') inputElement: ElementRef;
  result: AddServiceDialogResult = { url: "", name: "" };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<PromptDialogData>,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PromptDialog>
  ) {
    super(data,translate,dialogRef);
  }

  ngAfterViewInit() {
    setTimeout(()=>this.inputElement.nativeElement.focus());
  }
}