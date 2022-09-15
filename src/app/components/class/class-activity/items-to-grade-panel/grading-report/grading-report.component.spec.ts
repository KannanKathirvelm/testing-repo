import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GradingReportComponent } from './grading-report.component';

describe('GradingReportComponent', () => {
  let component: GradingReportComponent;
  let fixture: ComponentFixture<GradingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GradingReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GradingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
