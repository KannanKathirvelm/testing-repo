import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AtcOpportunitiesForGrowthComponent } from './atc-opportunities-for-growth.component';

describe('AtcOpportunitiesForGrowthComponent', () => {
  let component: AtcOpportunitiesForGrowthComponent;
  let fixture: ComponentFixture<AtcOpportunitiesForGrowthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtcOpportunitiesForGrowthComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcOpportunitiesForGrowthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
