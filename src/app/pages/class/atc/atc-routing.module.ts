import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AtcPage } from './atc.page';

const routes: Routes = [
  {
    path: '',
    component: AtcPage
  },
  {
    path: 'data-by-milestone',
    loadChildren: () => import('./data-by-milestone/data-by-milestone.module').then( m => m.DataByMilestonePageModule)
  },
  {
    path: 'data-by-diagnostic',
    loadChildren: () => import('./data-by-diagnostic/data-by-diagnostic.module').then( m => m.DataByDiagnosticPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtcPageRoutingModule {}
