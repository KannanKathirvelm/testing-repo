import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnscheduledActivitiesPage } from './unscheduled-activities.page';

const routes: Routes = [
  {
    path: '',
    component: UnscheduledActivitiesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnscheduledActivitiesPageRoutingModule {}
