import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { routerPath } from '@constants/router-constants';

import { ClassPage } from './class.page';

const routes: Routes = [
  {
    path: '',
    component: ClassPage,
    children: [{
      path: 'atc',
      loadChildren: () => import('./atc/atc.module').then(m => m.AtcPageModule)
    },
    {
      path: routerPath('classActivities'),
      loadChildren: () => import('./class-activities/class-activities.module').then(m => m.ClassActivitiesPageModule)
    },
    {
      path: 'settings',
      loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule)
    },
    {
      path: 'journey',
      loadChildren: () => import('./journey/journey.module').then(m => m.JourneyPageModule)
    },
    {
      path: 'add-course',
      loadChildren: () => import('./add-course/add-course.module').then( m => m.AddCoursePageModule)
    },
    {
      path: 'proficiency',
      loadChildren: () => import('./proficiency/proficiency.module').then(m => m.ProficiencyPageModule)
    }
  ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassPageRoutingModule { }
