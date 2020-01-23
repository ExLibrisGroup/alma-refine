import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { RefineTableComponent, RefineTableGuard } from './refine-table/refine-table.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'refine', component: RefineTableComponent, canActivate: [RefineTableGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
