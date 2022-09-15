import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RubricReportComponent } from './rubric-report.component';

describe('RubricReportComponent', () => {
  let component: RubricReportComponent;
  let fixture: ComponentFixture<RubricReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RubricReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RubricReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
