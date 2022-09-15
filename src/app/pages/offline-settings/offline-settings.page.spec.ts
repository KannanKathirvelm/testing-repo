import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfflineSettingsPage } from './offline-settings.page';

describe('OfflineSettingsPage', () => {
  let component: OfflineSettingsPage;
  let fixture: ComponentFixture<OfflineSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineSettingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
