import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataByMilestonePage } from './data-by-milestone.page';

const routes: Routes = [
  {
    path: '',
    component: DataByMilestonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataByMilestonePageRoutingModule {}
