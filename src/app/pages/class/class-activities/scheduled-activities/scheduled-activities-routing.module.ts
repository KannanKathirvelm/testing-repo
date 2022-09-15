import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ScheduledActivitiesPage } from './scheduled-activities.page';

const routes: Routes = [
  {
    path: '',
    component: ScheduledActivitiesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduledActivitiesPageRoutingModule {}
