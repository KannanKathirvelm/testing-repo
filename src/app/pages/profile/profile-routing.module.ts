import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { routerPath } from '@constants/router-constants';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
    children: [
      {
        path: routerPath('aboutMe'),
        loadChildren: () => import('@pages/profile/about-me/about-me.module').then(m => m.AboutMePageModule)
      },
      {
        path: routerPath('preferences'),
        loadChildren: () => import('@pages/profile/preferences/preferences.module').then(m => m.PreferencesPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule { }
