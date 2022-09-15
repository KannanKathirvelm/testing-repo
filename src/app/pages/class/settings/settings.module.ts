import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { ApplicationDirectivesModule } from '@directives/application-directives.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsPageRoutingModule } from './settings-routing.module';
import { SettingsPage } from './settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    SettingsPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    ApplicationDirectivesModule
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule { }
