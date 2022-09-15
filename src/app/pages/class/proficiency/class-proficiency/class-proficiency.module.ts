import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { ClassProficiencyPageRoutingModule } from './class-proficiency-routing.module';

import { ClassProficiencyPage } from './class-proficiency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    ApplicationPipesModule,
    ClassProficiencyPageRoutingModule
  ],
  declarations: [ClassProficiencyPage]
})
export class ClassProficiencyPageModule { }
