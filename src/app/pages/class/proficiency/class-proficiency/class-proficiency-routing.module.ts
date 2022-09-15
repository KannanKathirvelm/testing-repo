import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClassProficiencyPage } from './class-proficiency.page';

const routes: Routes = [
  {
    path: '',
    component: ClassProficiencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassProficiencyPageRoutingModule { }
