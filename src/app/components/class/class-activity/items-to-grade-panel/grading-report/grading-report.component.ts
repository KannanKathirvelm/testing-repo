import { Component, OnInit, ViewChild } from '@angular/core';
import { ClassMembersModel } from '@app/models/class/class';
import { ClassService } from '@app/providers/service/class/class.service';
import { ITEMS_TO_GRADE_TABS, OA_TEXT, OA_TYPE, PLAYER_EVENT_SOURCE, ROLES, RUBRIC } from '@constants/helper-constants';
import { IonSlides } from '@ionic/angular';
import { CollectionsModel } from '@models/collection/collection';
import { GradeDetailsModel, TabsModel } from '@models/offline-activity/offline-activity';
import { ProfileModel } from '@models/profile/profile';
import {
  FrqQuestionAnswerModel,
  OaStudentRubric
} from '@models/rubric/rubric';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { OfflineActivityService } from '@providers/service/offline-activity/offline-activity.service';
import { RubricService } from '@providers/service/rubric/rubric.service';
import { calculateAverageScore, toTimestamp } from '@utils/global';
import { collapseAnimation } from 'angular-animations';
import axios from 'axios';

@Component({
  selector: 'nav-grading-report',
  templateUrl: './grading-report.component.html',
  styleUrls: ['./grading-report.component.scss'],
  animations: [collapseAnimation({ duration: 300, delay: 0 })]
})
export class GradingReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @ViewChild('slideWithNav') public slides: IonSlides;
  public oaGrading: GradeDetailsModel;
  public collection: CollectionsModel;
  public isAssessmentGrading: boolean;
  public students: Array<OaStudentRubric>;
  public studentSlider: { isBeginningSlide: boolean; isEndSlide: boolean; };
  public activeStudentIndex: number;
  public activeStudent: OaStudentRubric;
  public tabs: Array<TabsModel>;
  public classId: string;
  public activitySessionId: string;
  public gradedScore: boolean;
  public showStudentList: boolean;
  public showOaAnswerTab: boolean;
  public showTeacherTab: boolean;
  public showStudentTab: boolean;
  public allItemsAreGraded: boolean;
  public showSuccessAlert: boolean;
  public studentSlideOpts: { initialSlide: number, slidesPerView: number, speed: number };
  public contentSource: string;
  public classMembers: ClassMembersModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private rubricService: RubricService,
    private classActivityService: ClassActivityService,
    private offlineActivityService: OfflineActivityService,
    private classService: ClassService
  ) { }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.students = [];
    this.classId = this.oaGrading.classId;
    this.fetchClassMembers();
    this.activeStudentIndex = 0;
    this.collection = this.oaGrading.collection;
    this.isAssessmentGrading = this.oaGrading.isAssessmentGrading;
    this.tabs = this.isAssessmentGrading ? ITEMS_TO_GRADE_TABS.FRQ : ITEMS_TO_GRADE_TABS.OA;
    const teacherTabIndex = this.tabs.length - 1;
    const teacherTab = this.tabs[teacherTabIndex];
    this.showTab(teacherTab, teacherTabIndex);
    this.contentSource = this.oaGrading.isDCAContext ? PLAYER_EVENT_SOURCE.DAILY_CLASS : PLAYER_EVENT_SOURCE.COURSE_MAP;
    this.studentSlider = {
      isBeginningSlide: true,
      isEndSlide: true
    };
    this.studentSlideOpts = {
      initialSlide: 0,
      slidesPerView: 1,
      speed: 400
    };
    this.fetchStudentList();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentList
   * This method is used to fetch student list
   */
  public fetchStudentList() {
    const questionId = this.oaGrading.content.id;
    return axios.all<{}>([
      this.isAssessmentGrading ? this.rubricService.getStudentsForQuestion(questionId, this.frqStudentContext(), this.oaGrading.isDCAContext, true) : this.offlineActivityService.getGradingStudentList(this.oaStudentContext(), true)
    ]).then(axios.spread((studentIds: Array<string>) => {
      const studentList: Array<ProfileModel> = this.classMembers.members.filter(member => studentIds.includes(member.id) )
      if (studentList.length) {
        studentList.forEach((studentItem) => {
          const student = new OaStudentRubric();
          student.id = studentItem.id;
          student.name = studentItem.fullName;
          student.thumbnail = studentItem.avatarUrl;
          this.students.push(student);
        });
        this.studentSlider.isEndSlide = this.students.length <= 1;
        this.setActiveStudent(0, false);
      }
    }));
  }

  /**
   * @function fetchClassMembers
   * This method is used to fetch class members
   */
  public fetchClassMembers(){
    this.classService.fetchClassMembersByClassId(this.classId).then((classMembers: ClassMembersModel) => {
      this.classMembers = classMembers;
    })
  }

  /**
   * @function fetchFrqQuestion
   * This method is used to fetch frq question
   */
  public fetchFrqQuestion() {
    const questionId = this.oaGrading.content.id;
    this.classActivityService.readQuestion(questionId).then((questionResponse) => {
      const rubric = questionResponse.rubric;
      this.students.map((student) => {
        const frqQuestion = new FrqQuestionAnswerModel();
        frqQuestion.questionDesc = questionResponse.description;
        frqQuestion.questionId = questionResponse.id;
        student.frqQa = frqQuestion;
        student.teacherRubric = this.rubricService.parseRubric(ROLES.TEACHER, rubric);
      });
      this.fetchFrqAnswerForStudent();
    });
  }

  /**
   * @function fetchFrqAnswerForStudent
   * This method is used to fetch frq answer for student
   */
  public fetchFrqAnswerForStudent() {
    const frqAnswerParams = this.frqAnswerParams();
    const studentId = this.activeStudent.id;
    const questionId = this.oaGrading.content.id;
    this.rubricService.getAnswerToGrade(questionId, studentId, frqAnswerParams, this.oaGrading['isDCAContext']).then((answerResponse) => {
      const studentFrq = this.activeStudent.frqQa;
      studentFrq.answerText = answerResponse.answerText;
      studentFrq.sessionId = answerResponse.sessionId;
    });
  }

  /**
   * @function frqAnswerParams
   * This method is used to normalize params for frq answer
   */
  public frqAnswerParams() {
    if (this.oaGrading.isDCAContext) {
      return {
        classId: this.classId,
        collectionId: this.collection.id,
        activityDate: this.oaGrading.activityDate
      };
    } else {
      return {
        classId: this.classId,
        courseId: this.oaGrading.courseId,
        collectionId: this.oaGrading.collection.id,
        unitId: this.oaGrading.unitId,
        lessonId: this.oaGrading.lessonId
      }
    }
  }

  /**
   * @function fetchOaSubmission
   * This method is used to fetch oa submission
   */
  public fetchOaSubmission() {
    const studentId = this.activeStudent.id;
    this.fetchOaSubmissions(studentId).then((submission) => {
      const taskSubmission = submission.tasks;
      const oaRubrics = submission.oaRubrics;
      const studentGrades = oaRubrics.studentGrades;
      const teacherGrades = oaRubrics.teacherGrades;
      this.activeStudent.teacherRubric = this.rubricService.parseRubric(ROLES.TEACHER, this.oaGrading.content.teacherRubric, teacherGrades);
      this.activeStudent.studentRubric = this.rubricService.parseRubric(ROLES.STUDENT, this.oaGrading.content.studentRubric, studentGrades);
      this.activeStudent.activityTasks = this.offlineActivityService.parseStudentTaskSubmission(taskSubmission, this.oaGrading.content.tasks);
      this.activitySessionId = submission.sessionId;
    });
  }

  /**
   * @function fetchOaSubmissions
   * This method is used to fetch oa submissions and tasks
   */
  private fetchOaSubmissions(studentId) {
    const params = !this.oaGrading.isDCAContext && this.submissionParamsForCourseMap() || null;
    return this.classActivityService.fetchCaOaSubmissions(this.classId, this.oaGrading.dcaContentId, studentId, this.oaGrading.content.tasks, this.oaGrading.isDCAContext, params);
  }

  public submissionParamsForCourseMap() {
    return {
      courseId: this.oaGrading.courseId,
      unitId: this.oaGrading.unitId,
      lessonId: this.oaGrading.lessonId
    }
  }

  /**
   * @function oaStudentContext
   * This method is used to get oa student context
   */
  public oaStudentContext() {
    if (this.oaGrading.isDCAContext) {
      return {
        type: OA_TEXT,
        source: OA_TYPE.DCA,
        contentId: this.oaGrading.dcaContentId,
        classId: this.oaGrading.classId
      }
    } else {
      return {
        type: OA_TEXT,
        source: OA_TYPE.COURSE_MAP,
        classId: this.oaGrading.classId,
        contentId: this.oaGrading.dcaContentId,
        courseId: this.oaGrading.courseId
      }
    }
  }

  /**
   * @function frqStudentContext
   * This method is used to get frq student context
   */
  public frqStudentContext() {
    if (this.oaGrading.isDCAContext) {
      return {
        classId: this.oaGrading.classId,
        collectionId: this.oaGrading.collection.id,
        activityDate: this.oaGrading.activityDate
      }
    } else {
      return {
        collectionId: this.oaGrading.collection.id,
        classId: this.oaGrading.classId,
        courseId: this.oaGrading.courseId
      }
    }
  }

  /**
   * @function setActiveStudent
   * This method is used to set active student
   */
  public setActiveStudent(studentIndex, isInitial = true) {
    this.students.map((student, index) => {
      student.isActive = index === studentIndex;
      return student;
    });
    this.activeStudent = this.students[studentIndex];
    this.activeStudentIndex = studentIndex;
    if (this.isAssessmentGrading) {
      if (isInitial) {
        this.fetchFrqAnswerForStudent();
      }
    } else {
      this.fetchOaSubmission();
    }
  }

  /**
   * @function slideByIndex
   * This method is used to show slide by next
   */
  public slideByIndex(index, slides) {
    slides.slideTo(index);
    this.showStudentList = false;
    this.setActiveStudent(index);
  }

  // Move to Next slide
  public async slideNext(object, slideView) {
    const activeIndex = await slideView.getActiveIndex();
    slideView.slideNext(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
    this.setActiveStudent(activeIndex + 1);
  }

  // Call methods to check if slide is first or last to enable disbale navigation
  public checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }

  // Call methods to check if slide is Beginning
  public checkisBeginning(object, slideView) {
    slideView.isBeginning().then((istrue) => {
      object.isBeginningSlide = istrue;
    });
  }

  // Call methods to check if slide is end
  public checkisEnd(object, slideView) {
    slideView.isEnd().then((istrue) => {
      object.isEndSlide = istrue;
    });
  }

  // Method called when slide is changed by drag or navigation
  public SlideDidChange(object, slideView) {
    this.checkIfNavDisabled(object, slideView);
  }

  // Move to previous slide
  public async slidePrev(object, slideView) {
    const activeIndex = await slideView.getActiveIndex();
    slideView.slidePrev(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
    this.setActiveStudent(activeIndex - 1);
  }

  /**
   * @function showTab
   * This method is used to active tab
   */
  public showTab(tab, selectedTabIndex) {
    this.tabs.map((rubricTab, tabIndex) => {
      rubricTab.isActive = tabIndex === selectedTabIndex;
    });
    this.showTeacherTab = tab.title === 'TEACHER_RUBRIC';
    this.showStudentTab = tab.title === 'STUDENT_RUBRIC';
    this.showOaAnswerTab = tab.title === 'ANSWER';
  }

  /**
   * @function updateCategoryLevels
   * This method is used to update category level
   */
  public updateCategoryLevels(event) {
    const teacherRubric = this.activeStudent.teacherRubric;
    if (event.isIncrement) {
      teacherRubric.gradedScore = event.score;
      teacherRubric.gradedScoreInPercentage = calculateAverageScore(event.score, teacherRubric.maxScore);;
    } else {
      const selectedCategory = teacherRubric.categories[event.selectCategoryIndex];
      const selectedLevel = selectedCategory.levels[event.selectedLevelIndex];
      selectedCategory.comment = event.levelComment;
      selectedCategory.teacherGradedScore = selectedLevel ? selectedLevel.score : 0;
      selectedCategory.scoreInPercentage = selectedLevel ? selectedLevel.scoreInPercentage : 0;
      selectedCategory.levels.map((level, levelIndex) => {
        level.isChecked = levelIndex === event.selectedLevelIndex;
      });
      const overallScore = this.getTeacherGradedOverallScore();
      teacherRubric.gradedScore = overallScore;
      if (overallScore) {
        teacherRubric.gradedScoreInPercentage = calculateAverageScore(overallScore, teacherRubric.maxScore);
      }
    }
  }

  /**
   * @function getTeacherGradedOverallScore
   * This method is used to get overall teacher graded for student
   */
  public getTeacherGradedOverallScore() {
    let score = 0;
    const teacherRubric = this.activeStudent.teacherRubric;
    teacherRubric.categories.forEach((category) => {
      category.levels.forEach((level) => {
        if (category.allowsScoring && level.isChecked) {
          score += level.score;
        }
      });
    });
    return score;
  }

  /**
   * @function toggleStudentList
   * This method is used to toggle student list
   */
  public toggleStudentList() {
    this.showStudentList = !this.showStudentList;
  }

  /**
   * @function submitGrade
   * This method is used to submit grade
   */
  public submitGrade() {
    const selectedLevels = this.parseSelectedLevels();
    const oaGradeModel = this.parseOaGrade(selectedLevels);
    const activeStudentIndex = this.students.findIndex((item) => item.isActive);
    this.rubricService.submitOAGrade(oaGradeModel).then(() => {
      if (activeStudentIndex === this.students.length - 1) {
        this.allItemsAreGraded = true;
      } else {
        this.slideByIndex(activeStudentIndex + 1, this.slides);
      }
    });
  }

  /**
   * @function submitAssessmentGrade
   * This method is used to submit assessment grade
   */
  public submitAssessmentGrade() {
    const selectedLevels = this.parseSelectedLevels();
    const assessmentGradeModel = this.parseAssessmentGrade(selectedLevels);
    this.rubricService.submitAssessmentGrade(assessmentGradeModel).then(() => {
      if (this.students.length > 1) {
        this.fetchFrqAnswerForStudent();
      } else {
        this.allItemsAreGraded = true;
      }
    });
  }

  /**
   * @function getSelectedLevels
   * This method is used to get selected levels
   */
  private parseSelectedLevels() {
    const filteredCategories = [];
    const teacherRubric = this.activeStudent.teacherRubric;
    const categories = teacherRubric.categories;
    categories.forEach((category) => {
      const selectedLevel = category.levels.find((level) => {
        return level.isChecked;
      });
      if (selectedLevel) {
        const filteredLevel = {
          category_title: category.title,
          level_max_score: category.allowsScoring ? teacherRubric.maxScore : 0,
          level_obtained: selectedLevel.name,
          level_score: category.allowsScoring ? selectedLevel.score : 0,
          level_comment: category.comment ? category.comment : '',
        };
        filteredCategories.push(filteredLevel);
      }
    });
    return filteredCategories;
  }

  /**
   * @function parseOaGrade
   * This method is used to parse the oa grade
   */
  private parseOaGrade(selectedLevels) {
    const activeStudent = this.activeStudent;
    const eventContext = {
      category_score: selectedLevels,
      class_id: this.classId,
      collection_id: this.collection.id,
      collection_type: this.oaGrading.collection.format,
      content_source: this.contentSource,
      grader: RUBRIC.TEACHER.toLowerCase(),
      max_score: activeStudent.teacherRubric.maxScore,
      overall_comment: activeStudent.teacherRubric.comment,
      rubric_id: activeStudent.teacherRubric.id,
      student_score: activeStudent.teacherRubric.gradedScore,
      student_id: activeStudent.id,
      course_id: this.oaGrading.courseId,
      lesson_id: this.oaGrading.lessonId,
      unit_id: this.oaGrading.unitId
    };
    if(this.oaGrading.isDCAContext) {
      eventContext['dca_content_id'] = this.oaGrading.dcaContentId;
      eventContext['session_id'] = this.activitySessionId;
    }
    return eventContext;
  }

  /**
   * @function parseAssessmentGrade
   * Method to parse assessment grade
   */
  private parseAssessmentGrade(selectedLevels) {
    const activeStudent = this.activeStudent;
    return {
      activity_date: this.oaGrading.activityDate,
      additional_context: null,
      category_score: selectedLevels,
      class_id: this.classId,
      collection_id: this.collection.id,
      collection_type: this.oaGrading.contentType,
      content_source: this.contentSource,
      created_at: toTimestamp(new Date()),
      creator_id: activeStudent.teacherRubric.creatorId,
      description: null,
      event_name: 'resource.rubric.grade',
      gut_codes: null,
      max_score: activeStudent.teacherRubric.maxScore,
      metadata: null,
      modifier_id: activeStudent.teacherRubric.modifierId,
      original_creator_id: activeStudent.teacherRubric.originalCreatorId,
      original_rubric_id: activeStudent.teacherRubric.originalRubricId,
      overall_comment: activeStudent.teacherRubric.comment,
      parent_rubric_id: activeStudent.teacherRubric.parentRubricId,
      publish_date: null,
      resource_id: activeStudent.frqQa.questionId,
      rubric_id: activeStudent.teacherRubric.id,
      session_id: this.activeStudent.frqQa.sessionId,
      student_id: activeStudent.id,
      student_score: activeStudent.teacherRubric.gradedScore,
      taxonomy: activeStudent.teacherRubric.taxonomy,
      tenant: activeStudent.teacherRubric.tenant,
      tenant_root: null,
      title: activeStudent.teacherRubric.title,
      updated_at: toTimestamp(new Date()),
      url: ''
    }
  }

  /**
   * @function dismissAlert
   * Method to close alert
   */
  public dismissAlert(value) {
    if (value) {
      this.closeRubric();
      this.showSuccessAlert = false;
    }
  }

  /**
   * @function closeRubric
   * This method is used to close the pullup
   */
  public closeRubric() {
    const initialTab = this.tabs[0];
    this.showTab(initialTab, 0);
    this.modalService.dismissModal();
  }
}
