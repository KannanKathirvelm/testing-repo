import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { clearState } from '@stores/logout.reset';
import { reducers } from '@stores/reducers';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(reducers, { metaReducers: [clearState] })
  ],
  declarations: [],
})
export class AppStoreModule { }
