import { Injectable } from '@angular/core';
import { Unit0Model } from '@app/models/unit0/unit0';
import { Unit0Provider } from '@app/providers/apis/unit0/unit0';
import { ASSESSMENT, COLLECTION } from '@constants/helper-constants';
import { STORE_KEY } from '@constants/store-constants';
import { ClassMembersGrade } from '@models/class/class';
import { LessonModel, MilestoneLessonListModel } from '@models/lesson/lesson';
import { MilestoneListModel, MilestoneModel } from '@models/milestone/milestone';
import { Route0ContentModel } from '@models/route0/route0';
import { TaxonomyGrades } from '@models/taxonomy/taxonomy';
import { Store } from '@ngrx/store';
import { MilestoneProvider } from '@providers/apis/milestone/milestone';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import { ClassService } from '@providers/service/class/class.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { Route0Service } from '@providers/service/route0/route0.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { setMilestone } from '@stores/actions/milestone.action';
import { getMilestoneByClassId } from '@stores/reducers/milestone.reducer';
import { cloneObject, removeDuplicateValues } from '@utils/global';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {

  // ------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private performanceProvider: PerformanceProvider,
    private taxonomyService: TaxonomyService,
    private route0Service: Route0Service,
    private classService: ClassService,
    private milestoneProvider: MilestoneProvider,
    private store: Store,
    private performanceService: PerformanceService,
    private unit0Provider: Unit0Provider
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getMilestones
   * Method to used to get milestone
   */
  public getMilestones(reqParams) {
    return axios
    .all([
      this.fetchMilestones(
        reqParams.classId,
        reqParams.courseId,
        reqParams.fwCode,
        reqParams.studentId
      ),
      this.unit0Provider.getUnit0List(reqParams.classId, reqParams.courseId)
    ]).then(axios.spread((milestones: Array<MilestoneModel> | any, unit0Content: Array<Unit0Model>) => {
      milestones = [...unit0Content, ...milestones];
      reqParams.milestones = milestones && milestones.length ? milestones : [];
      if (reqParams.fwCode) {
        this.performanceService.fetchMilestonePerformance(reqParams);
      }
      return milestones;
    }));
  }

  /**
   * @function fetchStudentMilestone
   * This method is used to fetch milestones
   */
  public fetchStudentMilestone(studentId, hasPerformance = true) {
    const classDetails = this.classService.class;
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const classPerference = classDetails.preference;
    const route0Applicable = classDetails.route0Applicable;
    const fwCode =
      classPerference && classPerference.framework
        ? classPerference.framework
        : null;
    const filters = {
      subject: classDetails.preference.subject,
      fw_code: fwCode,
    };
    return axios
      .all([
        this.taxonomyService.fetchGradesBySubject(filters),
        this.getMilestone(
          classId,
          courseId,
          fwCode,
          false,
          hasPerformance,
          studentId
        ),
        this.getMilestone(
          classId,
          courseId,
          fwCode,
          true,
          hasPerformance,
          studentId
        ),
        route0Applicable ? this.route0Service.fetchRoute0Contents(classId,
          courseId, fwCode, studentId) : null,
        this.unit0Provider.getUnit0List(classId, courseId)
      ])
      .then(
        axios.spread((
          taxonomyGrades: Array<TaxonomyGrades>,
          classMilestones: Array<MilestoneModel>,
          milestones: Array<MilestoneModel>,
          route0ContentResponse: Route0ContentModel,
          unit0Content: Array<Unit0Model>
        ) => {
          const gradeBounds = this.classService.classMembers.memberGradeBounds;
          const route0Milestones = route0ContentResponse ? route0ContentResponse.route0Content.milestones : [];
          return this.parseMilestoneContent(
            classDetails,
            taxonomyGrades,
            gradeBounds,
            classMilestones,
            milestones,
            route0Milestones,
            studentId,
            unit0Content
          );
        }));
  }


  /**
   * @function parseMilestoneContent
   * This method is used to parse the milestone content
   */
  public parseMilestoneContent(
    classDetails,
    taxonomyGrades,
    gradeBounds,
    classMilestones,
    milestones,
    route0Milestones,
    studentId,
    unit0Content
  ) {
    const userId = studentId;
    const grades = taxonomyGrades.sort(
      (grade1, grade2) => grade1.sequenceId - grade2.sequenceId
    );

    const gradeBound: ClassMembersGrade = gradeBounds.find(
      (grade: ClassMembersGrade) => {
        return grade.userId === userId;
      }
    );
    const classGradeLowerBound = gradeBound.bounds.gradeLowerBound;
    const gradeUpperBound = gradeBound.bounds.gradeUpperBound;
    const startGrade = grades.find((grade) => {
      return grade.id === Number(classGradeLowerBound);
    });
    const startGradeIndex = grades.indexOf(startGrade);
    const endGrade = grades.find((grade) => {
      return grade.id === Number(gradeUpperBound);
    });
    const endGradeIndex = grades.indexOf(endGrade);
    const studentGrades = grades.slice(startGradeIndex, endGradeIndex + 1);
    const milestoneList = milestones.filter((milestone, milestoneIndex) => {
      const hasMilestoneContent = classMilestones.find(milestoneItem => milestoneItem.milestoneId === milestone.milestoneId);
      if (!hasMilestoneContent) {
        milestone.isRescoped = true;
        if (milestoneIndex) {
          const prevMilestone = milestones[milestoneIndex - 1];
          if (prevMilestone) {
            prevMilestone.nextMilestoneIsRescope = true;
          }
        }
      } else {
        milestone.competencyCount = hasMilestoneContent.competencyCount;
        milestone.computedEtlSecs = hasMilestoneContent.computedEtlSecs;
        milestone.isRescoped = false;
      }
      const gradeId = milestone.gradeId;
      const gradeModel = studentGrades.find((grade) => {
        return grade.id === gradeId;
      });
      if (gradeModel) {
        if (gradeId === classDetails.gradeCurrent) {
          milestone.isClassGrade = true;
        }
        return milestone;
      }
    });
    const parsedMilestones = this.addRoute0InMilestone(milestoneList, route0Milestones, unit0Content);
    return parsedMilestones;
  }

  /**
   * @function addRoute0InMilestone
   * This method is used to add route0 in milestone
   */
  public addRoute0InMilestone(milestones, route0Milestones, unit0Content) {
    const milestoneList = [...unit0Content, ...route0Milestones, ...milestones];
    return milestoneList.map((milestone, index) => {
      milestone.sequenceId = index + 1;
      return milestone;
    });
  }

  /**
   * @function getMilestone
   * Method to used to get milestone
   */
  public getMilestone(classId: string, courseId: string, fwCode: string, showFullCourse: boolean, hasPerformance, studentId) {
    return this.fetchStudentMilestones(courseId, fwCode, classId, showFullCourse, studentId).then((milestones: Array<MilestoneModel>) => {
      if (showFullCourse && hasPerformance) {
        const params = {
          classId,
          courseId,
          fwCode,
          studentId,
          milestones
        }
        if (fwCode) {
          this.performanceService.fetchMilestonePerformance(params);
        }
      }
      return milestones;
    });
  }

  /**
   * @function fetchStudentMilestones
   * This Method is used to get the milestone from the store
   */
  public fetchStudentMilestones(courseId: string, fwCode: string, classId: string, showFullCourse: boolean, studentId) {
    const classIdParam = !showFullCourse ? classId : null;
    const userId = !showFullCourse ? studentId : null;
    return this.milestoneProvider.fetchMilestones(classIdParam, courseId, fwCode, userId).then((result: MilestoneListModel) => {
      return result.milestones;
    });
  }

  /**
   * @function fetchLessonsPerformance
   * This Method is used to fetch lessons performance
   */
  public fetchLessonsPerformance(classId: string, milestoneId: string, courseId: string, fwCode: string, filtertedLessons, userId) {
    return axios
      .all([
        this.performanceProvider.fetchMilestoneLessonPerformance(classId, courseId, fwCode, milestoneId, null, userId, ASSESSMENT),
        this.performanceProvider.fetchMilestoneLessonPerformance(classId, courseId, fwCode, milestoneId, null, userId, COLLECTION)
      ])
      .then(
        axios.spread((
          lessonAssessmentPerformance,
          lessonCollectionPerformance
        ) => {
          this.normalizeLessonAssessmentPerformance(filtertedLessons, lessonAssessmentPerformance);
          this.normalizeLessonCollectionPerformance(filtertedLessons, lessonCollectionPerformance);
          return filtertedLessons;
        }));
  }


  /**
   * @function normalizeLessonCollectionPerformance
   * This Method is used to set performance to lesson
   */
  private normalizeLessonCollectionPerformance(lessons, lessonPerformanceResponse) {
    return lessons.map((lesson) => {
      if (lessonPerformanceResponse.length) {
        const lessonPerformanceList = lessonPerformanceResponse[0].usageData || lessonPerformanceResponse;
        const lessonPerformance = lessonPerformanceList.find((item) => item.lessonId === lesson.lessonId);
        if (lessonPerformance && lesson.performance) {
          lesson.performance.timeSpent = lessonPerformance.timeSpent;
        } else {
          if (lessonPerformance) {
            lesson.performance = {
              timeSpent: lessonPerformance.timeSpent,
              totalCount: lessonPerformance.totalCount
            };
          }
        }
      }
      return lesson;
    });
  }

  /**
   * @function normalizeLessonAssessmentPerformance
   * This Method is used to set performance to lesson
   */
  private normalizeLessonAssessmentPerformance(lessons, lessonPerformanceResponse) {
    return lessons.map((lesson) => {
      if (lessonPerformanceResponse.length) {
        const lessonPerformanceList = lessonPerformanceResponse[0].usageData || lessonPerformanceResponse;
        const lessonPerformance = lessonPerformanceList.find((item) => item.lessonId === lesson.lessonId);
        lesson.performance = lessonPerformance;
      }
      return lesson;
    });
  }

  /**
   * @function getMilestoneLessons
   * Method to used to get milestone lessons
   */
  public getMilestoneLessons(reqParams) {
    const lessonPromise = reqParams.lessons
      ? Promise.resolve(reqParams.lessons)
      :  this.fetchMilestoneLessons(
        reqParams.courseId,
        reqParams.milestoneId
      )
    return lessonPromise.then((lessonsResult: Array<LessonModel>) => {
      const lessons = removeDuplicateValues(lessonsResult, 'lessonId');
      if (!reqParams.isTeacherView && !reqParams.lessons) {
        const skippedContents = reqParams.skippedContents;
        const skippedLessons = skippedContents ? skippedContents.lessons : [];
        lessons.map((lesson) => {
          lesson.isRescoped = skippedLessons.includes(lesson.lessonId);
          return lesson;
        });
      }
      reqParams.lessons = lessons && lessons.length ? lessons : [];
      this.performanceService.fetchMilestoneLessonPerformance(reqParams);
      return lessons;
    });
  }

  // -------------------------------------------------------------------------
  // store methods

  /**
   * @function fetchMilestones
   * This method is used to fetch milestone list
   */
  public fetchMilestones(classId, courseId, fwCode, studentId = null) {
    return new Promise((resolve, reject) => {
      const storeId = studentId ?
        `${STORE_KEY.MILESTONE}_${studentId}_${classId}` :
        `${STORE_KEY.MILESTONE}_${classId}`;
      const milestoneStoreSubscription = this.store.select(getMilestoneByClassId(storeId)).subscribe((milestoneData) => {
        if (!milestoneData) {
          this.milestoneProvider.fetchMilestones(classId, courseId, fwCode, studentId).then((result:MilestoneListModel) => {
            const milestones = result.milestones;
            this.store.dispatch(setMilestone({ key: storeId, data: milestones }));
            resolve(cloneObject(milestones));
          });
        } else {
          resolve(cloneObject(milestoneData));
        }
      }, (error) => {
        reject(error);
      });
      milestoneStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchMilestoneLessons
   * This method is used to fetch milestone lesson list
   */
  public fetchMilestoneLessons(courseId, milestoneId) {
    return this.milestoneProvider.fetchMilestoneLessons(courseId, milestoneId).then((lessonResult: MilestoneLessonListModel) => {
      return lessonResult.lessons;
    });
  }

  /**
   * @function fetchSkippedContents
   * This Method is used to fetch the skipped contents
   */
  public fetchSkippedContents(classId, courseId, userId) {
    return this.milestoneProvider.fetchSkippedContents(classId, courseId, userId);
  }

  /**
   * @function fetchSkippedContents
   * This Method is used to fetch the skipped contents
   */
  public fetchMilestoneByDate(classId, startDate?, endDate?) {
    return this.milestoneProvider.fetchMilestoneByDate(classId, startDate, endDate);
  }
}
