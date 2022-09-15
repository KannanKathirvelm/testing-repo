import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { AvatarModule } from 'ngx-avatar';

import { IonicModule } from '@ionic/angular';

import { DataByDiagnosticPageRoutingModule } from './data-by-diagnostic-routing.module';

import { DataByDiagnosticPage } from './data-by-diagnostic.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplicationPipesModule,
    TranslateModule,
    AvatarModule,
    DataByDiagnosticPageRoutingModule
  ],
  declarations: [DataByDiagnosticPage]
})
export class DataByDiagnosticPageModule {}
