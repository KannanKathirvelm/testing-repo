import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AtcDiagnosticReportComponent } from './atc-diagnostic-report.component';

describe('AtcDiagnosticReportComponent', () => {
  let component: AtcDiagnosticReportComponent;
  let fixture: ComponentFixture<AtcDiagnosticReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtcDiagnosticReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcDiagnosticReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
