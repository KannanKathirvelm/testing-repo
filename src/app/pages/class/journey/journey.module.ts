import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { JourneyPageRoutingModule } from './journey-routing.module';
import { JourneyPage } from './journey.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JourneyPageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [JourneyPage]
})
export class JourneyPageModule {}
