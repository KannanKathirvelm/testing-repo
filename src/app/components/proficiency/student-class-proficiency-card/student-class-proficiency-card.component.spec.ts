import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentClassProficiencyCardComponent } from './student-class-proficiency-card.component';

describe('StudentClassProficiencyCardComponent', () => {
  let component: StudentClassProficiencyCardComponent;
  let fixture: ComponentFixture<StudentClassProficiencyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentClassProficiencyCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentClassProficiencyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
