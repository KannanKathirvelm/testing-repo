import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OfflineSettingsPageRoutingModule } from './offline-settings-routing.module';
import { OfflineSettingsPage } from './offline-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    OfflineSettingsPageRoutingModule
  ],
  declarations: [OfflineSettingsPage]
})
export class OfflineSettingsPageModule {}
