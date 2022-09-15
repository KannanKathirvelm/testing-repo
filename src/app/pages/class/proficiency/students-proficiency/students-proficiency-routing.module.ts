import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentsProficiencyPage } from './students-proficiency.page';

const routes: Routes = [
  {
    path: '',
    component: StudentsProficiencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsProficiencyPageRoutingModule {}
