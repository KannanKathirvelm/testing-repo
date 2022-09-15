import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import {
  ClassesModel,
  ClassMembersDetailModel,
  ClassMembersGrade,
  ClassMembersModel,
  ClassModel,
  ClassPerformanceModel,
  CourseVisibilityModel,
  LessonsVisibilityModel,
  RosterGradeModel,
  RosterGradeSubjectModel,
  SecondaryClassesModel,
  TeacherDetailsModel,
  UnitsVisibilityModel
} from '@models/class/class';
import { HttpService } from '@providers/apis/http';
import { ProfileProvider } from '@providers/apis/profile/profile';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';

@Injectable({
  providedIn: 'root'
})
export class ClassProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1/classes';
  private namespaceV2 = 'api/nucleus/v2/classes';
  private namespaceInsightV2 = 'api/nucleus-insights/v2/classes';
  private sendMailNamespace = 'api/nucleus-utils/v1';

  // -------------------------------------------------------------------------
  // API Path

  public getClassMembersAPIPath(classId) {
    return `${this.namespace}/${classId}/members`;
  }

  public getSecondaryClassesDetailsAPIPath() {
    return `${this.namespaceV2}/details`;
  }

  public getCourseMapContentsAPIPath(classId) {
    return `${this.namespaceV2}/${classId}/courses`;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileProvider: ProfileProvider,
    private httpService: HttpService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private databaseService: DatabaseService
  ) {}

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchClassList
   * This method is used to fetch the class list
   */
  public fetchClassList() {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}`;
        this.httpService.get<ClassesModel>(endpoint).then((result) => {
          const normalizedClasses = this.normalizeClasses(result.data);
          this.databaseService.upsertDocument(
            DOCUMENT_KEYS.CLASSES,
            normalizedClasses
          );
          resolve(normalizedClasses);
        }, reject);
      } else {
        this.databaseService
          .getDocument(DOCUMENT_KEYS.CLASSES)
          .then((result) => {
            const response = result.value;
            resolve(response);
          }, reject);
      }
    });
  }

  /**
   * @function assignCourse
   * This method is used to assign the course
   */
  public assignCourse(classId, courseId) {
    const endpoint = `${this.namespace}/${classId}/courses/${courseId}`;
    return this.httpService.put(endpoint, {});
  }

  /**
   * @function updateNewClass
   * This method is used to post the newly created class to the list
   */
  public updateNewClass(params) {
    const endpoint = `${this.namespace}`;
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function fetchClassByClassId
   * This method is used to fetch the class detail
   */
  public fetchClassByClassId(id) {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/${id}`;
        this.httpService.get<ClassModel>(endpoint).then((res) => {
          const normalizeClass = this.normalizeClass(res.data);
          resolve(normalizeClass);
        }, reject);
      } else {
        this.databaseService
          .getDocument(DOCUMENT_KEYS.CLASSES)
          .then((result) => {
            const classDetails = result.value?.classes.find((classItem) => {
              return classItem.id === id;
            });
            resolve(classDetails);
          }, reject);
      }
    });
  }

  /**
   * @function updateClass
   * This method is used to update class
   */
  public updateClass(classId, params) {
    const endpoint = `${this.namespace}/${classId}`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function fetchClassMembersByClassId
   * This method is used to fetch the class members
   */
  public fetchClassMembersByClassId(classId): Promise<ClassMembersModel> {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.CLASS_MEMBERS,
      {
        classId
      }
    );
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = this.getClassMembersAPIPath(classId);
        this.httpService.get<ClassMembersModel>(endpoint).then((res) => {
          const normalizeClassMembers = this.normalizeClassMembers(res.data);
          resolve(normalizeClassMembers);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function storeClassMembers
   * This method is used to store the class members in the pouch db
   */
  public storeClassMembers(classId, classMembers) {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.CLASS_MEMBERS,
      {
        classId
      }
    );
    const normalizeClassMembers = this.normalizeClassMembers(classMembers);
    this.databaseService.upsertDocument(databaseKey, normalizeClassMembers);
  }

  /**
   * @function deleteClassMember
   * This method is used to delete a class memeber
   */
  public deleteClassMember(classId, memberId) {
    const endpoint = `${this.namespace}/${classId}/members/${memberId}`;
    return this.httpService.delete(endpoint);
  }

  /**
   * @function deleteClassRoom
   * This method is used to delete a class room
   */
  public deleteClassRoom(classId) {
    const endpoint = `${this.namespace}/${classId}`;
    return this.httpService.delete(endpoint, {});
  }

  /**
   * @function updateLanguage
   * This method is used to update language
   */
  public updateLanguage(classId, languageCode) {
    const endpoint = `${this.namespace}/${classId}/language/${languageCode}`;
    return this.httpService.put(endpoint, {});
  }

  /**
   * @function archiveClassRoom
   * This method is used to archive a class room
   */
  public archiveClassRoom(classId) {
    const endpoint = `${this.namespace}/${classId}/archive`;
    return this.httpService.put(endpoint, {});
  }

  /**
   * @function reRouteClass
   * This method is used for reroute
   */
  public reRouteClass(classId, users) {
    const endpoint = `${this.namespace}/${classId}/members/settings/reroute`;
    const params = {
      users
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function addClassMember
   * This method is used to add a class memeber to a class
   */
  public addStudentsToClass(classId, studentIds) {
    const endpoint = `${this.namespace}/${classId}/students`;
    const params = {
      students: studentIds
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function activateClassMember
   * This method is used to activate a class memeber
   */
  public activateClassMember(classId, users) {
    const endpoint = `${this.namespace}/${classId}/members/activate`;
    const params = {
      users
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function deactivateClassMember
   * This method is used to de-activate a class memeber
   */
  public deactivateClassMember(classId, users) {
    const endpoint = `${this.namespace}/${classId}/members/deactivate`;
    const params = {
      users
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function fecthSecondaryClassesDetails
   * This method is used to fetch secondary classes
   */
  public fecthSecondaryClassesDetails(classIds, classKey) {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.CLASS_SECONDARY_CLASSES_DETAILS,
      {
        classId: classKey
      }
    );
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = this.getSecondaryClassesDetailsAPIPath();
        const request = JSON.stringify({
          classIds
        });
        this.httpService.post(endpoint, request).then((res) => {
          const normalizeClassesData = this.normalizeAllClass(
            res.data.class_details
          );
          resolve(normalizeClassesData);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function storeSecondaryClassDetails
   * This method is used to store secondary classes
   */
  public storeSecondaryClassDetails(classId, secondaryClasses) {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.CLASS_SECONDARY_CLASSES_DETAILS,
      {
        classId
      }
    );
    const normalizeClassesData = this.normalizeAllClass(
      secondaryClasses.class_details
    );
    this.databaseService.upsertDocument(databaseKey, normalizeClassesData);
  }

  /**
   * @function fetchClassPerformance
   * This method is used to fetch class performance
   */
  public fetchClassPerformance(classCourseIds) {
    return new Promise((resolve, reject) => {
      const dataBaseKey = DOCUMENT_KEYS.CLASSES_PERFORMANCE;
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespaceInsightV2}/performance`;
        const param = JSON.stringify({
          classes: classCourseIds
        });
        this.httpService
          .post<ClassPerformanceModel>(endpoint, param)
          .then((res) => {
            const response = res.data;
            const normalizeClassPerformanceSummary = response.usageData.map(
              (classPerformanceSummary) => {
                return this.normalizeClassPerformanceSummary(
                  classPerformanceSummary
                );
              }
            );
            this.databaseService.upsertDocument(
              DOCUMENT_KEYS.CLASS_COURSE_MAP_CONTENT,
              normalizeClassPerformanceSummary
            );
            resolve(normalizeClassPerformanceSummary);
          }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          const arrayOne = [result.value[1]];
          resolve(arrayOne);
        }, reject);
      }
    });
  }

  /**
   * @function routerSyncSettings
   * This method is used to update router sync settings
   */
  public routerSyncSettings(classId, params) {
    const endpoint = `${this.namespace}/${classId}/roster/sync/settings`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function updatePreference
   * This method is used to update preference
   */
  public updatePreference(classId, preference) {
    const endpoint = `${this.namespace}/${classId}/preference`;
    const params = {
      preference
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function updateRerouteSettings
   * This method is used to update reroute settings
   */
  public updateRerouteSettings(classId, settings) {
    const endpoint = `${this.namespace}/${classId}/settings/reroute`;
    return this.httpService.put(endpoint, settings);
  }

  /**
   * @function updateClassCommunitySettings
   * This method is used to update class settings
   */
  public updateClassCommunitySettings(classId, settings) {
    const endpoint = `${this.namespace}/${classId}/community/collaboration/settings`;
    return this.httpService.put(endpoint, settings);
  }

  /**
   * @function setupIncompletedClass
   * This method is used to complete the class setup for incompleted class
   */
  public setupIncompletedClass(classData) {
    const endpoint = `${this.namespace}/setup`;
    return this.httpService.post(endpoint, classData);
  }

  /**
   * @function fetchRosterGrades
   * This method is used to fetch the roster data by roster id
   */
  public fethcRosterGrades(rosterIds) {
    const endpoint = `${this.namespace}/roster/grades`;
    return this.httpService.post(endpoint, rosterIds).then((response) => {
      return this.normalizeRosterData(response.data);
    });
  }

  private normalizeRosterData(payload) {
    const rosterGradeSubjects = payload.roster_grade_subjects || [];
    return rosterGradeSubjects.map((rosterData) => {
      const rosterGrade: RosterGradeModel = {
        rosterId: rosterData.roster_id,
        lowerRosterGrade: rosterData.lower_roster_grade,
        subjects: this.normalizeRosterSubjects(rosterData.subjects || [])
      };
      return rosterGrade;
    });
  }

  private normalizeRosterSubjects(subjects) {
    return subjects.map((subject) => {
      const rosterSubject: RosterGradeSubjectModel = {
        gradeId: subject.grade_id,
        gradeName: subject.grade_name,
        label: subject.label,
        code: subject.code,
        fwCode: subject.fw_code
      };
      return rosterSubject;
    });
  }

  /**
   * @function normalizeClassMembers
   * This method is used to normalize the class member
   */
  public normalizeClassMembers(payload): ClassMembersModel {
    let owner = null;
    if (Array.isArray(payload.details) && payload.details.length) {
      owner = payload.details.find((item) => {
        return item.id === payload.owner[0];
      });
    }
    const classMembers: ClassMembersModel = {
      owner: owner ? this.profileProvider.normalizeReadProfile(owner) : null,
      collaborators: this.filterCollaborators(payload),
      details: this.normalizeClassMembersDetail(payload),
      members: this.filterMembers(payload),
      memberGradeBounds: this.filterMembersGradeBounds(payload)
    };
    return classMembers;
  }

  /**
   * @function normalizeClassMembersDetail
   * This method is used to normalize class members detail
   */
  public normalizeClassMembersDetail(payload): Array<ClassMembersDetailModel> {
    const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
    return payload.details.map((item) => {
      const detail: ClassMembersDetailModel = {
        createdAt: item.created_at,
        diagAsmtState: item.diag_asmt_state,
        email: item.email,
        firstName: item.first_name,
        id: item.id,
        showEmail: item.show_email,
        initialLpDone: item.initial_lp_done,
        isActive: item.is_active || false,
        lastName: item.last_name,
        profileBaselineDone: item.profile_baseline_done,
        rosterGobalUserid: item.roster_global_userid,
        thumbnail: item.thumbnail ? `${basePath}${item.thumbnail}` : null
      };
      return detail;
    });
  }

  /**
   * @function filterMembersGradeBounds
   * This method is used to filter the grades bounds
   */
  public filterMembersGradeBounds(payload) {
    const membersGradeBounds = payload.member_grade_bounds || [];
    return membersGradeBounds.map((item: ClassMembersGrade) => {
      const classMembersKey = Object.keys(item);
      const classMember: ClassMembersGrade = {
        userId: `${classMembersKey}`,
        bounds: {
          gradeLowerBound: item[`${classMembersKey}`].grade_lower_bound,
          gradeUpperBound: item[`${classMembersKey}`].grade_upper_bound,
          gradeLevel: item[`${classMembersKey}`].grade_level
        }
      };
      return classMember;
    });
  }

  /**
   * @function filterCollaborators
   * This method is used to filter collaborators
   */
  public filterCollaborators(payload) {
    return this.filterElements(payload, 'collaborator');
  }

  /**
   * @function filterMembers
   * This method is used to filter members
   */
  public filterMembers(payload) {
    return this.filterElements(payload, 'member');
  }

  /**
   * @function filterElements
   * This method is used to filter elements
   */
  public filterElements(payload, property) {
    const elements = payload[property];
    const memberGradeBounds = this.filterMembersGradeBounds(payload);
    if (elements && elements.length) {
      return elements.map((elementId) => {
        let element = null;
        if (Array.isArray(payload.details) && payload.details.length) {
          element = payload.details.find((item) => {
            return item.id === elementId;
          });
        }
        const result = element
          ? this.profileProvider.normalizeReadProfile(element)
          : null;
        const memberBounds = memberGradeBounds.find(
          (item) => item.userId === result.id
        );
        if (memberBounds) {
          Object.assign(result, { bounds: memberBounds.bounds });
        }
        return result;
      });
    } else {
      return [];
    }
  }

  /**
   * @function normalizeClassPerformanceSummary
   * Normalize class performance
   */
  private normalizeClassPerformanceSummary(payload): ClassPerformanceModel {
    if (!Object.keys(payload).length) {
      return {} as ClassPerformanceModel;
    }
    const result: ClassPerformanceModel = {
      id: payload.classId,
      classId: payload.classId,
      timeSpent: payload.timeSpent,
      score: payload.scoreInPercentage,
      sessionId: payload.lastSessionId,
      totalCompleted: payload.completedCount,
      total: payload.totalCount || payload.completedCount
    };
    return result;
  }

  /**
   * @function normalizeClasses
   * Normalize classes
   */
  private normalizeClasses(payload): ClassesModel {
    const classList: ClassesModel = {
      classes: this.normalizeAllClass(payload.classes),
      collaborator: payload.collaborator,
      member: payload.member,
      memberCount: payload.member_count,
      owner: payload.owner,
      teacherDetails: this.normalizeTeacherDetails(payload.teacher_details)
    };
    return classList;
  }

  /**
   * @function normalizeTeacherDetails
   * Normalize teacher details
   */
  private normalizeTeacherDetails(payload): Array<TeacherDetailsModel> {
    return payload.map((item) => {
      const teacherDetails: TeacherDetailsModel = {
        email: item.email,
        firstName: item.first_name,
        id: item.id,
        lastName: item.last_name,
        rosterGlobalUserid: item.roster_global_userid,
        thumbnail: item.thumbnail
      };
      return teacherDetails;
    });
  }

  /**
   * @function normalizeAllClass
   * Normalize all class model
   */
  private normalizeAllClass(payload): Array<ClassModel> {
    return payload.map((item) => {
      return this.normalizeClass(item);
    });
  }

  /**
   * @function normalizeClass
   * Normalize class
   */
  private normalizeClass(payload): ClassModel {
    const classModel: ClassModel = {
      classSharing: payload.class_sharing,
      code: payload.code,
      collaborator: payload.collaborator,
      contentVisibility: payload.content_visibility,
      courseId: payload.course_id,
      courseTitle: payload.course_title,
      courseVersion: payload.course_version,
      coverImage: payload.cover_image,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      description: payload.description,
      endDate: payload.end_date,
      forceCalculateIlp: payload.force_calculate_ilp,
      gooruVersion: payload.gooru_version,
      grade: payload.grade,
      gradeCurrent: payload.grade_current,
      gradeLowerBound: payload.grade_lower_bound,
      gradeUpperBound: payload.grade_upper_bound,
      greeting: payload.greeting,
      id: payload.id,
      isArchived: payload.is_archived,
      milestoneViewApplicable: payload.milestone_view_applicable,
      minScore: payload.min_score,
      primaryLanguage: payload.primary_language,
      rosterId: payload.roster_id,
      route0Applicable: payload.route0_applicable,
      preference: payload.preference,
      setting: payload.setting,
      title: payload.title,
      updatedAt: payload.updated_at,
      isPublic: payload.is_public
    };
    return classModel;
  }

  /**
   * @function updateCollaborators
   * method to update collaborators
   */
  public updateCollaborators(classId, collaboratorIds) {
    const endpoint = `${this.namespace}/${classId}/collaborators`;
    const params = {
      collaborator: collaboratorIds
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function updateClassOwner
   * method to update class owner
   */
  public updateClassOwner(classId, userId) {
    const endpoint = `${this.namespace}/${classId}/owner/transfer`;
    const params = {
      user_id: userId
    };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function fetchMultipleClassList
   * method to fetch multiple class list
   */
  public fetchMultipleClassList(classId) {
    const endpoint = `${this.namespace}/${classId}/secondaryclasses`;
    return this.httpService
      .get<Array<SecondaryClassesModel>>(endpoint)
      .then((response) => {
        return this.normalizeSecondayClasses(response.data.classes);
      });
  }

  /**
   * @function normalizeSecondayClasses
   * method to normalize secondary classes
   */
  public normalizeSecondayClasses(payload): Array<SecondaryClassesModel> {
    return payload.map((item) => {
      const secondaryClass = {
        id: item.id,
        code: item.code,
        title: item.title
      };
      return secondaryClass;
    });
  }

  /**
   * @function sendWelcomeMail
   * method is used to send welcome mail
   */
  public sendWelcomeMail(params) {
    const endpoint = `${this.sendMailNamespace}/emails`;
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function updateContentVisibility
   * method is used to fetch content visibility
   */
  public updateContentVisibility(params) {
    const classId = params.classId;
    let data;
    if (params.type === 'lesson') {
      data = {
        lessons: params.contents
      }
    } else if (params.type === 'unit') {
      data = {
        units: params.contents
      }
    } else {
      data = {
        assessments: params.contents
      }
    }
    const endpoint = `${this.namespace}/${classId}/courses`;
    return this.httpService.put(endpoint,data);
  }

  /**
   * @function fetchCourseMapContents
   * method is used to fetch content visibility
   */
  public fetchCourseMapContents(classId) {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.CLASS_COURSE_MAP_CONTENT,
      {
        classId
      }
    );
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getCourseMapContentsAPIPath(classId);
        this.httpService.get(endpoint).then((response) => {
          const normalizeCourseMapContent = this.normalizeCourseMapContent(
            response.data
          );
          this.databaseService.upsertDocument(
            DOCUMENT_KEYS.CLASS_COURSE_MAP_CONTENT,
            normalizeCourseMapContent
          );
          resolve(normalizeCourseMapContent);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeCourseMapContent
   * method is used to normalize course map content
   */
  private normalizeCourseMapContent(payload) {
    const courseContent = payload.course || null;
    let course: CourseVisibilityModel;
    if (courseContent) {
      course = {
        id: courseContent.id,
        units: this.normalizeUnits(courseContent.units)
      };
    }
    return course;
  }

  /**
   * @function normalizeUnits
   * method is used to normalize units
   */
  private normalizeUnits(units) {
    return units.map((unit) => {
      return {
        id: unit.id,
        lessons: this.normalizeLessons(unit.lessons)
      } as UnitsVisibilityModel;
    });
  }

  /**
   * @function normalizeLessons
   * method is used to normalize lesson
   */
  private normalizeLessons(lessons) {
    return lessons.map((lesson) => {
      return {
        id: lesson.id,
        collections: lesson.collections,
        assessments: lesson.assessments
      } as LessonsVisibilityModel;
    });
  }

  /**
   * @function storeCourseMapContent
   * This method is used to store course map content visibility data
   */
  public storeCourseMapContent(classId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.CLASS_COURSE_MAP_CONTENT,
      {
        classId
      }
    );
    const normalizeCourseMapContent = this.normalizeCourseMapContent(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeCourseMapContent);
  }
}
