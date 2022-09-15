import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { routerPath } from '@constants/router-constants';
import { AppAuthGuard } from './app.auth.guard';
import { LoginAuthGuardService } from './login.auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: routerPath('login'),
    pathMatch: 'full'
  },
  {
    path: routerPath('login'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: routerPath('signUp'),
    loadChildren: () => import('@pages/sign-up/sign-up.module').then(m => m.SignUpPageModule)
  },
  {
    path: routerPath('loginWithTenantList'),
    loadChildren: () => import('@pages/login-with-tenant-list/login-with-tenant-list.module').then(m => m.LoginWithTenantListPageModule)
  },
  {
    path: routerPath('loginWithTenantUsername'),
    loadChildren: () => import('@pages/login-with-tenant-username/login-with-tenant-username.module').then(m => m.LoginWithTenantUsernamePageModule)
  },
  {
    path: routerPath('forgotPassword'),
    loadChildren: () => import('@pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: routerPath('loginWithUsername'),
    loadChildren: () => import('@pages/login-with-username/login-with-username.module').then(m => m.LoginWithUsernamePageModule)
  },
  {
    path: routerPath('loginWithTenantUrl'),
    loadChildren: () => import('@pages/login-with-tenant-url/login-with-tenant-url.module').then(m => m.LoginWithTenantUrlPageModule)
  },
  {
    path: routerPath('deeplinkTenantLogin'),
    loadChildren: () => import('@pages/login-with-tenant-url/login-with-tenant-url.module').then(m => m.LoginWithTenantUrlPageModule)
  },
  {
    path: routerPath('teacherHome'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/teacher-home/teacher-home.module').then(m => m.TeacherHomePageModule)
  },
  {
    path: routerPath('class'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/class/class.module').then(m => m.ClassPageModule)
  },
  {
    path: routerPath('StudentProficiency'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/student-proficiency/student-proficiency.module').then(m => m.StudentProficiencyPageModule)
  },
  {
    path: routerPath('profile'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: routerPath('emailVerify'),
    loadChildren: () => import('@pages/email-verify/email-verify.module').then(m => m.EmailVerifyPageModule)
  },
  {
    path: 'offline-settings',
    loadChildren: () => import('./pages/offline-settings/offline-settings.module').then( m => m.OfflineSettingsPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
