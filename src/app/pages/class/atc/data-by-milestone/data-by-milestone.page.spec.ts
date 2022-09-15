import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DataByMilestonePage } from './data-by-milestone.page';

describe('DataByMilestonePage', () => {
  let component: DataByMilestonePage;
  let fixture: ComponentFixture<DataByMilestonePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataByMilestonePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DataByMilestonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
