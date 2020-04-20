import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, getTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { RefineBibComponent } from './refine-bib/refine-bib.component';
import { RefineTableComponent } from './refine-table/refine-table.component';
import { SelectSetComponent } from './select-set/select-set.component';
import { SelectEntitiesComponent } from './select-entities/select-entities.component';
import { SettingsComponent } from './settings/settings.component';
import { ServiceDefComponent } from './settings/service-def/service-def.component'

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

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
      getToastrModule(),
      FormsModule,
      ReactiveFormsModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
