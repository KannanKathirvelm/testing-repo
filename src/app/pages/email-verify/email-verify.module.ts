import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EmailVerifyPageRoutingModule } from './email-verify-routing.module';
import { EmailVerifyPage } from './email-verify.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    ReactiveFormsModule,
    EmailVerifyPageRoutingModule
  ],
  declarations: [EmailVerifyPage]
})
export class EmailVerifyPageModule {}
