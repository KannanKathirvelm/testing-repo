import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ProficiencyPageRoutingModule } from './proficiency-routing.module';

import { ProficiencyPage } from './proficiency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    ProficiencyPageRoutingModule
  ],
  declarations: [ProficiencyPage]
})
export class ProficiencyPageModule { }
