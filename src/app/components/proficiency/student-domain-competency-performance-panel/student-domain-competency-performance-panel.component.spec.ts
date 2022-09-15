import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentDomainCompetencyPerformancePanelComponent } from './student-domain-competency-performance-panel.component';

describe('StudentDomainCompetencyPerformancePanelComponent', () => {
  let component: StudentDomainCompetencyPerformancePanelComponent;
  let fixture: ComponentFixture<StudentDomainCompetencyPerformancePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentDomainCompetencyPerformancePanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDomainCompetencyPerformancePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
