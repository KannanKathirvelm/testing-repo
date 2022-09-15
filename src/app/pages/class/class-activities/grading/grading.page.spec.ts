import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GradingPage } from './grading.page';

describe('GradingPage', () => {
  let component: GradingPage;
  let fixture: ComponentFixture<GradingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GradingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GradingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
