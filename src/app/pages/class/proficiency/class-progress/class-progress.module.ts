import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationDirectivesModule } from '@directives/application-directives.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { AvatarModule } from 'ngx-avatar';
import { CalendarModule } from 'primeng/calendar';
import { ClassProgressPageRoutingModule } from './class-progress-routing.module';
import { ClassProgressPage } from './class-progress.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassProgressPageRoutingModule,
    TranslateModule,
    ApplicationPipesModule,
    CalendarModule,
    ApplicationDirectivesModule,
    AvatarModule
  ],
  declarations: [ClassProgressPage]
})
export class ClassProgressPageModule { }
