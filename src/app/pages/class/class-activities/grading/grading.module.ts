import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GradingPageRoutingModule } from './grading-routing.module';
import { GradingPage } from './grading.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    GradingPageRoutingModule,
    TranslateModule
  ],
  declarations: [GradingPage]
})
export class GradingPageModule {}
