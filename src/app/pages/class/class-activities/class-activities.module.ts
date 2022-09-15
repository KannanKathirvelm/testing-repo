import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ClassActivitiesPageRoutingModule } from './class-activities-routing.module';

import { ClassActivitiesPage } from './class-activities.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassActivitiesPageRoutingModule,
    TranslateModule
  ],
  declarations: [ClassActivitiesPage]
})
export class ClassActivitiesPageModule {}
