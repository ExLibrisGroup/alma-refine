import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, getTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { NgxTippyModule } from 'ngx-tippy-wrapper';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { RefineBibComponent } from './refine-bib/refine-bib.component';
import { RefineTableComponent } from './refine-table/refine-table.component';
import { SelectSetComponent } from './select-set/select-set.component';
import { SelectEntitiesComponent } from './select-entities/select-entities.component';
import { SettingsComponent } from './settings/settings.component';
import { ServiceDefComponent } from './settings/service-def/service-def.component'

@NgModule({
   declarations: [
      AppComponent,
      MainComponent,
      RefineBibComponent,
      RefineTableComponent,
      SelectSetComponent,
      SelectEntitiesComponent,
      SettingsComponent,
      ServiceDefComponent
   ],
   imports: [
      MaterialModule,
      BrowserModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      HttpClientModule,
      getTranslateModule(),
      AlertModule,
      FormsModule,
      ReactiveFormsModule,
      NgxTippyModule
   ],
   providers: [
      { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
    ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
