import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { 
   MatTableModule, 
   MatPaginatorModule, 
   MatSortModule, 
   MatFormFieldModule,
   MatProgressSpinnerModule,
   MatInputModule,
   MatButtonModule,
   MatSelectModule,
   MatRadioModule,
   MatCardModule,
   MatAutocompleteModule,
   MatListModule,
   MatIconModule,
   MatProgressBarModule
 } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TopMenuComponent } from './top-menu/top-menu.component';
import { RefineTableComponent } from './refine-table/refine-table.component';
import { SelectSetComponent } from './select-set/select-set.component';
import { RefineBibComponent } from './refine-bib/refine-bib.component';

@NgModule({
   declarations: [
      AppComponent,
      TopMenuComponent,
      RefineTableComponent,
      SelectSetComponent,
      RefineBibComponent
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      AppRoutingModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatProgressSpinnerModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatSelectModule,
      MatRadioModule,
      MatCardModule,
      MatListModule,
      MatIconModule,
      MatAutocompleteModule,
      MatProgressBarModule,
      ReactiveFormsModule,
      FormsModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
