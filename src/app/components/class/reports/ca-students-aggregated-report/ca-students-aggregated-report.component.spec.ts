import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CaStudentsAggregatedReportComponent } from './ca-students-aggregated-report.component';

describe('CaStudentsAggregatedReportComponent', () => {
  let component: CaStudentsAggregatedReportComponent;
  let fixture: ComponentFixture<CaStudentsAggregatedReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaStudentsAggregatedReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaStudentsAggregatedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
