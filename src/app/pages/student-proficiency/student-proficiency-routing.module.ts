import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentProficiencyPage } from './student-proficiency.page';

const routes: Routes = [
  {
    path: '',
    component: StudentProficiencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentProficiencyPageRoutingModule { }
