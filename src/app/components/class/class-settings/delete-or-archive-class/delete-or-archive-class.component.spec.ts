import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeleteOrArchiveClassComponent } from './delete-or-archive-class.component';

describe('DeleteOrArchiveClassComponent', () => {
  let component: DeleteOrArchiveClassComponent;
  let fixture: ComponentFixture<DeleteOrArchiveClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteOrArchiveClassComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteOrArchiveClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
