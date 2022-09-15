import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { routerPath } from '@constants/router-constants';

import { ClassActivitiesPage } from './class-activities.page';

const routes: Routes = [
  {
    path: '',
    component: ClassActivitiesPage,
    children: [{
      path: routerPath('scheduledActivities'),
      loadChildren: () => import('./scheduled-activities/scheduled-activities.module').then(m => m.ScheduledActivitiesPageModule)
    },
    {
      path: routerPath('unScheduledActivities'),
      loadChildren: () => import('./unscheduled-activities/unscheduled-activities.module').then(m => m.UnscheduledActivitiesPageModule)
    },
    {
      path: routerPath('grading'),
      loadChildren: () => import('./grading/grading.module').then(m => m.GradingPageModule)
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassActivitiesPageRoutingModule { }
