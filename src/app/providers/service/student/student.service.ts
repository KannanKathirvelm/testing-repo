import { Injectable } from '@angular/core';
import { ProfileModel } from '@models/profile/profile';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class StudentService {

  // -------------------------------------------------------------------------
  // Properties

  public selectedStudentSubject: BehaviorSubject<ProfileModel>;
  public onSelectedStudent: Observable<ProfileModel>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
  ) {
    this.selectedStudentSubject = new BehaviorSubject<ProfileModel>(null);
    this.onSelectedStudent = this.selectedStudentSubject.asObservable();
  }

  public setSelectedStudent(user: ProfileModel) {
    this.selectedStudentSubject.next(user);
  }

  /**
   * @function clearState
   * Method to clear state values
   */
  public clearState() {
    this.selectedStudentSubject.next(null);
  }
}
