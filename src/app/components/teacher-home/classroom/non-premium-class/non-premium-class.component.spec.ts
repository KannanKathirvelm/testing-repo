import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NonPremiumClassComponent } from './non-premium-class.component';

describe('NonPremiumClassComponent', () => {
  let component: NonPremiumClassComponent;
  let fixture: ComponentFixture<NonPremiumClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonPremiumClassComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NonPremiumClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
