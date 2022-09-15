import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { AvatarModule } from 'ngx-avatar';
import { DataByMilestonePageRoutingModule } from './data-by-milestone-routing.module';
import { DataByMilestonePage } from './data-by-milestone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplicationPipesModule,
    TranslateModule,
    AvatarModule,
    DataByMilestonePageRoutingModule
  ],
  declarations: [DataByMilestonePage]
})
export class DataByMilestonePageModule {}
