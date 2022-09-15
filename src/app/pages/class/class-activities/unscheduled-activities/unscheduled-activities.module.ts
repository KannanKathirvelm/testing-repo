import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { UnscheduledActivitiesPageRoutingModule } from './unscheduled-activities-routing.module';
import { UnscheduledActivitiesPage } from './unscheduled-activities.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UnscheduledActivitiesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [UnscheduledActivitiesPage]
})
export class UnscheduledActivitiesPageModule {}
