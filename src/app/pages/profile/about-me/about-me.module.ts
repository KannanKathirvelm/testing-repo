import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { AboutMePageRoutingModule } from './about-me-routing.module';

import { AboutMePage } from './about-me.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ApplicationPipesModule,
    AboutMePageRoutingModule
  ],
  declarations: [AboutMePage]
})
export class AboutMePageModule {}
