import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { StudentsProficiencyPageRoutingModule } from './students-proficiency-routing.module';
import { StudentsProficiencyPage } from './students-proficiency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    StudentsProficiencyPageRoutingModule
  ],
  declarations: [StudentsProficiencyPage]
})
export class StudentsProficiencyPageModule {}
