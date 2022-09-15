import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FrqGradingReportComponent } from './frq-grading-report.component';

describe('FrqGradingReportComponent', () => {
  let component: FrqGradingReportComponent;
  let fixture: ComponentFixture<FrqGradingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrqGradingReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FrqGradingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
