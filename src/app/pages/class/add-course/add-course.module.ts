import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCoursePageRoutingModule } from './add-course-routing.module';

import { AddCoursePage } from './add-course.page';
import { ComponentsModule } from '@app/components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddCoursePageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [AddCoursePage]
})
export class AddCoursePageModule {}
