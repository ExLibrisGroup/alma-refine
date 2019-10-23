import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RefineTableComponent } from './refine-table/refine-table.component';


const routes: Routes = [
    { path: '', component: RefineTableComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
