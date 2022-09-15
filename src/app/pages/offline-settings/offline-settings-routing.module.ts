import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OfflineSettingsPage } from './offline-settings.page';

const routes: Routes = [
  {
    path: '',
    component: OfflineSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfflineSettingsPageRoutingModule {}
