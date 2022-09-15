import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AtcPage } from './atc.page';

describe('AtcPage', () => {
  let component: AtcPage;
  let fixture: ComponentFixture<AtcPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtcPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
