import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AtcDataByMilestoneComponent } from './atc-data-by-milestone.component';

describe('AtcDataByMilestoneComponent', () => {
  let component: AtcDataByMilestoneComponent;
  let fixture: ComponentFixture<AtcDataByMilestoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtcDataByMilestoneComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcDataByMilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
