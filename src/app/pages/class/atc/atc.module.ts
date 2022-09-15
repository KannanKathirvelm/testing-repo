import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatExpansionModule } from '@angular/material/expansion';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { AtcPageRoutingModule } from './atc-routing.module';

import { AtcPage } from './atc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    MatExpansionModule,
    AtcPageRoutingModule,
    ApplicationPipesModule,
    TranslateModule
  ],
  declarations: [AtcPage]
})
export class AtcPageModule {}
