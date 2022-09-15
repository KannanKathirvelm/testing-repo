import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassProficiencyPage } from './class-proficiency.page';

describe('ClassProficiencyPage', () => {
  let component: ClassProficiencyPage;
  let fixture: ComponentFixture<ClassProficiencyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassProficiencyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassProficiencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
