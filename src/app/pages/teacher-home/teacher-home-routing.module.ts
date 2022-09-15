import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeacherHomePage } from './teacher-home.page';

const routes: Routes = [
  {
    path: '',
    component: TeacherHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherHomePageRoutingModule {}
