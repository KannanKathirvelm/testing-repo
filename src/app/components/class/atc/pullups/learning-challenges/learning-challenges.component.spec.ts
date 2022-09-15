import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearningChallengesPullUpComponent } from './learning-challenges.component';

describe('LearningChallengesPullUpComponent', () => {
  let component: LearningChallengesPullUpComponent;
  let fixture: ComponentFixture<LearningChallengesPullUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningChallengesPullUpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LearningChallengesPullUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
