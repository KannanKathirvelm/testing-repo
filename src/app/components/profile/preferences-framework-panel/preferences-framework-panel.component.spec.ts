import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreferencesFrameworkPanelComponent } from './preferences-framework-panel.component';

describe('PreferencesFrameworkPanelComponent', () => {
  let component: PreferencesFrameworkPanelComponent;
  let fixture: ComponentFixture<PreferencesFrameworkPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferencesFrameworkPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesFrameworkPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
