import { Injectable } from '@angular/core';
import { DEFAULT_CLASS_IMAGES } from '@constants/helper-constants';
import { ClassesModel, ClassMembersModel, ClassModel } from '@models/class/class';
import { CourseModel } from '@models/course/course';
import { ProfileModel } from '@models/profile/profile';
import { Store } from '@ngrx/store';
import { ClassProvider } from '@providers/apis/class/class';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { CourseService } from '@providers/service/course/course.service';
import {
  setActiveClass,
  setClassMembers,
  setSecondaryClasses
} from '@stores/actions/class.action';
import {
  getClassById,
  getClassMembersByClassId,
  getSecondaryClasses
} from '@stores/reducers/class.reducer';
import { cloneObject } from '@utils/global';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  public classSubject: BehaviorSubject<ClassModel>;
  public classMembersSubject: BehaviorSubject<ClassMembersModel>;
  public secondaryClassesSubject: BehaviorSubject<Array<ClassModel>>;
  public classesSubject: BehaviorSubject<ClassesModel>;
  public classNameUpdatedSubject: BehaviorSubject<boolean>;
  public classNameUpdated: Observable<boolean>;
  public fetchClassDetails: Observable<ClassModel>;

  constructor(
    private store: Store,
    private classProvider: ClassProvider,
    private courseService: CourseService,
    private competencyService: CompetencyService,
    private performanceProvider: PerformanceProvider
  ) {
    this.classSubject = new BehaviorSubject<ClassModel>(null);
    this.classMembersSubject = new BehaviorSubject<ClassMembersModel>(null);
    this.classesSubject = new BehaviorSubject<ClassesModel>(null);
    this.secondaryClassesSubject = new BehaviorSubject<Array<ClassModel>>([]);
    this.classNameUpdatedSubject = new BehaviorSubject<boolean>(false);
    this.fetchClassDetails = this.classSubject.asObservable();
    this.classNameUpdated = this.classNameUpdatedSubject.asObservable();
  }

  get class(): ClassModel {
    return this.classSubject ? cloneObject(this.classSubject.value) : null;
  }

  get classMembers(): ClassMembersModel {
    return this.classMembersSubject ? cloneObject(this.classMembersSubject.value) : null;
  }

  get activeStudentList(): Array<ProfileModel> {
    const classStudentList = this.classMembers ? cloneObject(this.classMembers.members) : [];
    const activeStudentList = classStudentList.filter((item) => item && item.isActive);
    const studentsList = activeStudentList.sort((a, b) => a.lastName.localeCompare(b.lastName));
    return cloneObject(studentsList);
  }

  get secondaryClasses(): Array<ClassModel> {
    return this.secondaryClassesSubject ? cloneObject(this.secondaryClassesSubject.value) : [];
  }

  get activeClasses() {
    return this.classesSubject ? cloneObject(this.classesSubject.value) : null;
  }

  /**
   * @function fetchActiveClasses
   * This Method to fetch active classes
   */
  public fetchActiveClasses() {
    return new Promise((resolve, reject) => {
      if (this.activeClasses !== null) {
        resolve(this.activeClasses);
      } else {
        this.classProvider.fetchClassList().then((classList: ClassesModel) => {
          const activeClasses = this.getActiveClasses(classList);
          const classes = {
            activeClasses,
            ...classList
          }
          this.classesSubject.next(classes);
          resolve(classes);
        }, reject);
      }
    });
  }

  /**
   * @function fetchClassList
   * This Method to fetch classes
   */
  public fetchClassList(): Promise<Array<ClassModel>> {
    return new Promise((resolve, reject) => {
      this.fetchActiveClasses().then((classList: ClassesModel) => {
        let activeClasses = classList.activeClasses;
        const inCompletedClasses = this.getIncompleteClasses(activeClasses);
        const rosterIds = inCompletedClasses.map((classData) => Number(classData.rosterId));
        const owner = classList.owner;
        activeClasses = this.orderByMemberId(activeClasses, owner);
        const courseIds = this.courseService.getListOfCourseIds(activeClasses);
        if (courseIds && courseIds.length) {
          this.courseService.fetchCourseList(courseIds).then(async (courses: Array<CourseModel>) => {
            activeClasses.map((activeClass) => {
              activeClass.isPremiumClass = this.isPremiumClass(activeClass);
              const course = courses.find((courseItem) => {
                return courseItem.id === activeClass.courseId;
              });
              const randomNumber = Math.floor(Math.random() * 3);
              return activeClass.course = course ? course :
                { thumbnailUrl: DEFAULT_CLASS_IMAGES[`CLASS_DEFAULT_${randomNumber}`] };
            });
            const nonPremiumClasses = this.getNonPremiumClasses(activeClasses);
            const nonPremiumClassCourseIds = this.courseService.getListOfCourseIds(nonPremiumClasses, true);
            const nonPremiumClassIds = this.getListOfClassIds(nonPremiumClasses);
            const premiumClasses = this.getPremiumClasses(activeClasses);
            const premiumClasseIds = this.getListOfClassIdsAndSubject(premiumClasses);
            if (nonPremiumClassCourseIds.length) {
              const classCourseIds = this.filterClasseCourseIds(nonPremiumClassCourseIds);
              if (classCourseIds && classCourseIds.length) {
                this.performanceProvider.fetchClassPerformance(classCourseIds).then(performanceSummary => {
                  const performanceKey = 'performanceSummary';
                  this.setPerformanceSummary(activeClasses, performanceSummary, performanceKey);
                });
              }
            }
            if (rosterIds.length) {
              await this.fethcRosterGrades({ roster_ids: rosterIds }).then(rosterGrades => {
                inCompletedClasses.forEach((classData) => {
                  const rosterGradeItems = rosterGrades.find((rosterSubject) => rosterSubject.rosterId === Number(classData.rosterId));
                  classData.rosterGrade = rosterGradeItems
                });
              });
            }
            if (nonPremiumClassIds.length) {
              this.performanceProvider.fetchCAPerformance(nonPremiumClassIds).then(performanceSummaryForDCA => {
                const performanceKey = 'performanceSummaryForDCA';
                this.setPerformanceSummary(activeClasses, performanceSummaryForDCA, performanceKey);
              });
            }
            if (premiumClasseIds.length) {
              const filterClassIds = premiumClasseIds.filter((item) => {
                return item.subjectCode !== null;
              });
              this.competencyService.fetchCompetencyCompletionStats(filterClassIds).then((competencyCompletionStats) => {
                const performanceKey = 'competencyStats';
                this.setPerformanceSummary(activeClasses, competencyCompletionStats, performanceKey);
              });
            }
            resolve(activeClasses);
          }, reject);
        } else {
          resolve(activeClasses);
        }
      }, reject);
    });
  }

  /**
   * @function filterClasseCourseIds
   * Method is used to filter class course ids
   */
  public filterClasseCourseIds(nonPremiumClassCourseIds) {
    return nonPremiumClassCourseIds.filter((classCourse) => {
      return classCourse.courseId && classCourse.courseId !== null && classCourse.courseId !== '';
    });
  }

  /**
   * @function fetchClassByClassId
   * Method to fetch class using classId
   */
  public fetchClassByClassId(classId): Promise<ClassModel> {
    return this.classProvider.fetchClassByClassId(classId).then((classData: ClassModel) => {
      classData.isPremiumClass = this.isPremiumClass(classData);
      this.classSubject.next(classData);
      return classData;
    });
  }

  /**
   * @function fetchClassMembersByClassId
   * This method is used to fetch the class members
   */
  public fetchClassMembersByClassId(classId, isForceReload?) {
    return new Promise((resolve, reject) => {
      if (isForceReload) {
        const memebers = this.loadClassMembersByClassId(classId);
        resolve(memebers);
      } else {
        const classMembersSubscription = this.selectClassMembersStateById(classId).subscribe((classMembers: ClassMembersModel) => {
          if (classMembers) {
            this.setClassMembersState(classMembers);
            resolve(classMembers);
          } else {
            this.loadClassMembersByClassId(classId);
          }
        }, reject);
        classMembersSubscription.unsubscribe();
      }
    });
  }

  /**
   * @function loadClassMembersByClassId
   * This method is used to fetch class memebers by id
   */
  public loadClassMembersByClassId(classId) {
    return this.classProvider.fetchClassMembersByClassId(classId).then((response: ClassMembersModel) => {
      this.storeClassMembersDataInState(classId, response);
      return response;
    });
  }

  /**
   * @function deleteClassMember
   * This method is used to delete class member
   */
  public deleteClassMember(classId, memberId) {
    return this.classProvider.deleteClassMember(classId, memberId);
  }


  /**
   * @function updateNewClass
   * This method is used to delete class member
   */
  public updateNewClass(params) {
    return this.classProvider.updateNewClass(params);
  }

  /**
   * @function fecthSecondaryClassesDetails
   * Method used to fetch secondary class details
   */
  public fecthSecondaryClassesDetails(classIds, key) {
    return new Promise((resolve, reject) => {
      const secondaryClassesSubscription = this.selectSecondaryClassesState(key).subscribe((secondaryClasses) => {
        if (secondaryClasses) {
          this.secondaryClassesSubject.next(secondaryClasses);
          resolve(secondaryClasses);
        } else {
          this.classProvider.fecthSecondaryClassesDetails(classIds, key)
            .then((classes) => {
              this.storeSecondaryClassDataInState(key, classes);
              resolve(classes);
            }, reject);
        }
      }, reject);
      secondaryClassesSubscription.unsubscribe();
    });
  }

  /**
   * @function storeClassDataInState
   * Method to store data in the state
   */
  public storeClassDataInState(key, data) {
    this.store.dispatch(setActiveClass({ key, data }));
  }

  /**
   * @function storeClassMembersDataInState
   * Method to store class members data in the state
   */
  public storeClassMembersDataInState(key, data) {
    this.store.dispatch(setClassMembers({ key, data }));
  }

  /**
   * @function storeSecondaryClassDataInState
   * Method to store secondary class data in the state
   */
  public storeSecondaryClassDataInState(key, data) {
    this.store.dispatch(setSecondaryClasses({ key, data }));
  }

  /**
   * @function selectClassStateById
   * Method to select class state data by id
   */
  public selectClassStateById(classId) {
    return this.store.select(getClassById(classId));
  }

  /**
   * @function selectClassMembersStateById
   * Method to select class members state data by id
   */
  public selectClassMembersStateById(classId) {
    return this.store.select(getClassMembersByClassId(classId));
  }

  /**
   * @function selectSecondaryClassesState
   * Method to select secondary classes state data
   */
  public selectSecondaryClassesState(classId) {
    return this.store.select(getSecondaryClasses(classId));
  }

  /**
   * @function fetchClassPerformance
   * Method to fetch class performance
   */
  public fetchClassPerformance(classCourseIds) {
    return new Promise((resolve, reject) => {
      const classIds = this.filterClasseCourseIds(classCourseIds);
      if (classIds && classIds.length) {
        const classPerformance = this.classProvider.fetchClassPerformance(classIds)
        resolve(classPerformance);
      } else {
        resolve();
      }
    });
  }

  /**
   * @function getListOfClassIds
   * Method to fetch class ids from the list of classes
   */
  public getListOfClassIds(activeClasses) {
    return activeClasses.map((activeClass) => {
      return activeClass.id;
    });
  }

  /**
   * @function getListOfClassIdsAndSubject
   * Method to fetch class ids and subject from the list of classes
   */
  public getListOfClassIdsAndSubject(activeClasses) {
    return activeClasses.map((activeClass) => {
      const subjectCode = activeClass.preference ? activeClass.preference.subject : null;
      return {
        classId: activeClass.id,
        subjectCode
      }
    });
  }

  /**
   * @function setPerformanceSummary
   * Method to used to set performance summary for given classes
   */
  private setPerformanceSummary(activeClasses, performanceSummaryList, performanceKey) {
    activeClasses.map(activeClass => {
      const performance = performanceSummaryList.find((performanceSummary) => {
        return performanceSummary.classId === activeClass.id;
      });
      activeClass[performanceKey] = performance ? performance : null;
      return activeClass;
    });
  }

  /**
   * @function getPremiumClasses
   * Method to get premium class
   */
  private getPremiumClasses(classes) {
    return classes.filter(classData => {
      return this.isPremiumClass(classData) || classData.isPublic;
    });
  }

  /**
   * @function isPremiumClass
   * Method to check whether premium or non-premium
   */
  private isPremiumClass(classData) {
    const classSetting = classData.setting;
    return classSetting ? classSetting['course.premium'] === true : false;
  }

  /**
   * @function getNonPremiumClasses
   * Method to used to get non premium classes
   */
  private getNonPremiumClasses(classes) {
    return classes.filter(classData => {
      return !this.isPremiumClass(classData);
    });
  }

  /**
   * @function orderByMemberId
   * Method is used to order by member id
   */
  public orderByMemberId(classes, memberIds) {
    return classes.sort((class1, class2) => {
      return memberIds.indexOf(class1.id) - memberIds.indexOf(class2.id);
    });
  }

  /**
   * Retrieve the student active and premium classes
   */
  private getActiveClasses(classList) {
    const classes = classList.classes;
    if (classes && !classes.length) {
      return [];
    }
    return classes.filter((aClass) => {
      return (classList.owner.includes(aClass.id) || classList.collaborator.includes(aClass.id));
    });
  }

  /**
   * Retrieve the teacher incomplete classes
   * @return {Class[]}
   */
  public getIncompleteClasses(classList) {
    return classList.filter(classData => {
      return (
        classData.rosterId &&
        !classData.isArchived &&
        (!classData.preference
          || !classData.preference.framework
          || !classData.preference.subject)
      );
    });
  }

  /**
   * @function addStudents
   * Method is used to add students for class
   */
  public addStudentsToClass(classId, studentIds) {
    return this.classProvider.addStudentsToClass(classId, studentIds);
  }

  /**
   * @function updateCollaborators
   * Method is used to update collaborators
   */
  public updateCollaborators(classId, collaboratorIds) {
    return this.classProvider.updateCollaborators(classId, collaboratorIds);
  }

  /**
   * @function routerSyncSettings
   * Method is used to update router sync settings
   */
  public routerSyncSettings(classId, settingsParams) {
    return this.classProvider.routerSyncSettings(classId, settingsParams);
  }

  /**
   * @function updateClassSettings
   * Method is used to update class settings
   */
  public updateClassSettings(classId, settings, isPremiumClass) {
    return this.updatePreference(classId, settings.preference).then(() => {
      if (isPremiumClass) {
        return this.updateRerouteSettings(classId, settings);
      }
    });
  }

  /**
   * @function updateClassCommunitySettings
   * Method is used to update class settings
   */
  public updateClassCommunitySettings(classId, settings) {
    return this.classProvider.updateClassCommunitySettings(classId, settings);
  }

  /**
   * @function updateRerouteSettings
   * Method is used to update reroute settings
   */
  public updateRerouteSettings(classId, settings) {
    return this.classProvider.updateRerouteSettings(classId, settings);
  }

  /**
   * @function updatePreference
   * Method is used to update preference
   */
  public updatePreference(classId, preference) {
    return this.classProvider.updatePreference(classId, preference);
  }

  /**
   * @function updateClass
   * Method is used to update class
   */
  public updateClass(classDetails, additionalParams) {
    const classId = classDetails.id;
    const params = this.getClassUpdateContext(classDetails, additionalParams);
    return this.classProvider.updateClass(classId, params).then(() => {
      return this.fetchClassByClassId(classId);
    });
  }

  /**
   * @function getClassUpdateContext
   * Method is used to get class update params
   */
  public getClassUpdateContext(classDetails, additionalParams) {
    return {
      title: classDetails.title,
      class_sharing: classDetails.classSharing,
      greeting: classDetails.greeting,
      min_score: classDetails.minScore,
      setting: additionalParams
    };
  }

  /**
   * @function updateLanguage
   * Method is used to update language
   */
  public updateLanguage(classId, languageCode) {
    return this.classProvider.updateLanguage(classId, languageCode);
  }

  /**
   * @function activateClassMember
   * Method is used to activate class member
   */
  public activateClassMember(classId, studentIds) {
    return this.classProvider.activateClassMember(classId, studentIds);
  }

  /**
   * @function deactivateClassMember
   * Method is used to deactivate class member
   */
  public deactivateClassMember(classId, studentIds) {
    return this.classProvider.deactivateClassMember(classId, studentIds);
  }

  /**
   * @function reRouteClass
   * Method is used to re route class
   */
  public reRouteClass(classId, users) {
    return this.classProvider.reRouteClass(classId, users);
  }

  /**
   * @function deleteClassRoom
   * Method is used to delete class room
   */
  public deleteClassRoom(classId) {
    return this.classProvider.deleteClassRoom(classId);
  }

  /**
   * @function setupIncompletedClass
   * Method is used to complete the setup for incompleted class rooms
   */
  public setupIncompletedClass(classId) {
    return this.classProvider.setupIncompletedClass(classId);
  }

  /**
   * @function fethcRosterGrades
   * Method is used to fetch class roster data
   */
  public fethcRosterGrades(rosterIds) {
    return this.classProvider.fethcRosterGrades(rosterIds);
  }

  /**
   * @function archiveClassRoom
   * Method is used to archive class room
   */
  public archiveClassRoom(classId) {
    return this.classProvider.archiveClassRoom(classId);
  }

  /**
   * @function setClassMembersState
   * Method is used to set class member state
   */
  public setClassMembersState(members) {
    return this.classMembersSubject.next(members);
  }

  /**
   * @function setClassNameUpdatedStatus
   * Method is used to set class name updated Status
   */
  public setClassNameUpdatedStatus(status) {
    return this.classNameUpdatedSubject.next(status);
  }

  /**
   * @function clearState
   * method to clear state
   */
  public clearState() {
    this.classSubject.next(null);
    this.classMembersSubject.next(null);
    this.secondaryClassesSubject.next([]);
  }

  /**
   * @function fetchMultipleClassList
   * Method to fetch multiple class list
   */
  public fetchMultipleClassList(classId) {
    return this.classProvider.fetchMultipleClassList(classId);
  }

  /**
   * @function sendWelcomeMail
   * Method to fetch mail
   */
  public sendWelcomeMail(params) {
    return this.classProvider.sendWelcomeMail(params);
  }

  /**
   * @function updateClassOwner
   * Method to update class owner
   */
  public updateClassOwner(classId, userId) {
    return this.classProvider.updateClassOwner(classId, userId);
  }

  /**
   * @function updateContentVisibility
   * Method is used to update content visibility
   */
  public updateContentVisibility(params) {
    return this.classProvider.updateContentVisibility(params);
  }

  /**
   * @function fetchCourseMapContents
   * Method is used to fetch content visibility
   */
  public fetchCourseMapContents(classId) {
    return this.classProvider.fetchCourseMapContents(classId);
  }
}
