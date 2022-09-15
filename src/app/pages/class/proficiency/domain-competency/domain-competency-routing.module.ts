import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DomainCompetencyPage } from './domain-competency.page';

const routes: Routes = [
  {
    path: '',
    component: DomainCompetencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DomainCompetencyPageRoutingModule {}
