import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearningMapActivityPullUpComponent } from './learning-map-activity-pull-up.component';

describe('LearningMapActivityPullUpComponent', () => {
  let component: LearningMapActivityPullUpComponent;
  let fixture: ComponentFixture<LearningMapActivityPullUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningMapActivityPullUpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LearningMapActivityPullUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
