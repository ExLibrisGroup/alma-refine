import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateModule } from "@ngx-translate/core";
import { DialogModule } from 'eca-components';
import { AddServiceDialog } from "./settings/add-service-dialog.component";

@NgModule({
  imports: [
    DialogModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [ AddServiceDialog ],
  entryComponents: [ AddServiceDialog ],
})
export class AppDialogModule { }