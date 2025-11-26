import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiniBrowserComponent } from './mini-browser/mini-browser.component';

const routes: Routes = [
  { path: '', component: MiniBrowserComponent },
  { path: 'browser', component: MiniBrowserComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
