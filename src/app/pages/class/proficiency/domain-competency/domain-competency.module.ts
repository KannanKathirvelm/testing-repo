import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DomainCompetencyPageRoutingModule } from './domain-competency-routing.module';

import { DomainCompetencyPage } from './domain-competency.page';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DomainCompetencyPageRoutingModule,
    ComponentsModule,
    ApplicationPipesModule,
    TranslateModule
  ],
  declarations: [DomainCompetencyPage]
})
export class DomainCompetencyPageModule { }
