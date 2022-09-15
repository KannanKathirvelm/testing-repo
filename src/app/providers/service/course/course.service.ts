import { Injectable } from '@angular/core';
import { CourseDetailModel } from '@models/course/course';
import { CourseProvider } from '@providers/apis/course/course';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CourseService {

  // ------------------------------------------------------------------------
  // Properties

  public classCourseSubject: BehaviorSubject<CourseDetailModel>;
  public updateCourseSubject: BehaviorSubject<string>;
  public updatedCourse: Observable<string>;

  // ------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private courseProvider: CourseProvider,
  ) {
    this.classCourseSubject = new BehaviorSubject<CourseDetailModel>(null);
    this.updateCourseSubject = new BehaviorSubject<string>(null);
    this.updatedCourse = this.updateCourseSubject.asObservable();
  }

  get classCourse(): CourseDetailModel {
    return this.classCourseSubject ? this.classCourseSubject.value : null;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCourseList
   * This method is used to fetch the course list
   */
  public fetchCourseList(courseIDs) {
    return this.courseProvider.fetchCourseList(courseIDs);
  }

  /**
   * @function fetchCourseById
   * This method is used to fetch the course by id
   */
  public fetchCourseById(courseId) {
    return this.courseProvider.fetchCourseById(courseId).then((course: CourseDetailModel) => {
      this.classCourseSubject.next(course);
      return course;
    });
  }


  /**
   * @function getListOfCourseIds
   * Method to fetch course ids from the list of classes
   */
  public getListOfCourseIds(activeClasses, isClassCourse?) {
    const listOfActiveCourseIds = [];
    activeClasses.forEach((activeClass) => {
      if (activeClass.courseId) {
        if (!isClassCourse) {
          listOfActiveCourseIds.push(activeClass.courseId);
        } else {
          const classCourseId = {
            classId: activeClass.id,
            courseId: activeClass.courseId,
          };
          listOfActiveCourseIds.push(classCourseId);
        }
      }
    });
    return listOfActiveCourseIds;
  }

  /**
   * @function calculateUserSkyline
   * Method is used to calculate user skyline
   */
  public calculateUserSkyline(classId, studentIds) {
    return this.courseProvider.calculateUserSkyline(classId, studentIds);
  }

  /**
   * @function clearState
   * Method to clear state values
   */
  public clearState() {
    this.classCourseSubject.next(null);
  }

  /**
   * @function getCourseStructure
   * Method to get course structure
   */
  public getCourseStructure(courseId, contentType) {
    return this.courseProvider.getCourseStructure(courseId, contentType);
  }
}
