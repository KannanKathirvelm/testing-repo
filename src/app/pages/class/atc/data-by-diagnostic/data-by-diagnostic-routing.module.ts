import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataByDiagnosticPage } from './data-by-diagnostic.page';

const routes: Routes = [
  {
    path: '',
    component: DataByDiagnosticPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataByDiagnosticPageRoutingModule {}
