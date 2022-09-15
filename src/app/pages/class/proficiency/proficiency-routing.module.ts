import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProficiencyPage } from './proficiency.page';

const routes: Routes = [
  {
    path: '',
    component: ProficiencyPage,
    children: [
      {
        path: 'class-proficiency',
        loadChildren: () => import('@pages/class/proficiency/class-proficiency/class-proficiency.module').then(m => m.ClassProficiencyPageModule)
      },
      {
        path: 'class-progress',
        loadChildren: () => import('@pages/class/proficiency/class-progress/class-progress.module').then(m => m.ClassProgressPageModule)
      },
      {
        path: 'domain-competency',
        loadChildren: () => import('@pages/class/proficiency/domain-competency/domain-competency.module').then(m => m.DomainCompetencyPageModule)
      },
      {
        path: 'students-proficiency',
        loadChildren: () => import('@pages/class/proficiency/students-proficiency/students-proficiency.module').then(m => m.StudentsProficiencyPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProficiencyPageRoutingModule { }
