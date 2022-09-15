import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { ScheduledActivitiesPageRoutingModule } from './scheduled-activities-routing.module';
import { ScheduledActivitiesPage } from './scheduled-activities.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    ScheduledActivitiesPageRoutingModule,
    ApplicationPipesModule
  ],
  declarations: [ScheduledActivitiesPage]
})
export class ScheduledActivitiesPageModule {}
