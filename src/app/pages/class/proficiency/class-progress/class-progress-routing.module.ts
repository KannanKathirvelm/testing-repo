import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClassProgressPage } from './class-progress.page';

const routes: Routes = [
  {
    path: '',
    component: ClassProgressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassProgressPageRoutingModule {}
