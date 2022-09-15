import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DataByDiagnosticPage } from './data-by-diagnostic.page';

describe('DataByDiagnosticPage', () => {
  let component: DataByDiagnosticPage;
  let fixture: ComponentFixture<DataByDiagnosticPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataByDiagnosticPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DataByDiagnosticPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
