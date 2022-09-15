import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassProgressPage } from './class-progress.page';

describe('ClassProgressPage', () => {
  let component: ClassProgressPage;
  let fixture: ComponentFixture<ClassProgressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassProgressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassProgressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
