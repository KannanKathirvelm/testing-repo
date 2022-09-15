import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeacherHomePageRoutingModule } from './teacher-home-routing.module';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherHomePage } from './teacher-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeacherHomePageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [TeacherHomePage]
})
export class TeacherHomePageModule {}
