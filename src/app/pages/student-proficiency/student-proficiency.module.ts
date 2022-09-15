import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { AvatarModule } from 'ngx-avatar';

import { StudentProficiencyPageRoutingModule } from './student-proficiency-routing.module';

import { StudentProficiencyPage } from './student-proficiency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    StudentProficiencyPageRoutingModule,
    AvatarModule
  ],
  declarations: [StudentProficiencyPage]
})
export class StudentProficiencyPageModule { }
