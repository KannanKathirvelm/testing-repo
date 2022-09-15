import { Injectable } from '@angular/core';
import { OA_TYPE, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import {
  AnswerTextModel,
  AnswerToGradeForDCAModel,
  CategoriesModel,
  GradeItem,
  GradeItems,
  ItemToGradeQuestions,
  LevelModel,
  RubricModel,
  RubricQuestionItem,
  RubricStudent
} from '@models/rubric/rubric';
import { HttpService } from '@providers/apis/http';
import { SessionService } from '@providers/service/session/session.service';

@Injectable({
  providedIn: 'root',
})
export class RubricProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v2';
  private namespaceV2 = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  private constructor(
    private httpService: HttpService,
    private sessionService: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function fetchRubricItems
   * This method is used to fetch Rubric items
   */
  public fetchRubricItems(params) {
    const endpoint = `${this.namespaceV2}/rubrics/items`;
    return this.httpService.get<Array<RubricStudent>>(endpoint, params).then((result) => {
      return params && params.source === PLAYER_EVENT_SOURCE.COURSE_MAP
        ? this.normalizeGradeItemsForCourseMap(result.data.gradeItems)
        : this.normalizeGradeItems(result.data.gradeItems)
    });
  }

  /**
   * @function normalizeGradeItems
   * This method is used to normalize grade item
   */
  private normalizeGradeItems(payload): Array<GradeItem> {
    return payload.map((item) => {
      const gradeItem: GradeItem = {
        activationDate: item.activationDate,
        collectionId: item.collectionId,
        collectionType: item.collectionType,
        dcaContentId: item.dcaContentId,
        studentCount: item.studentCount,
        students: item.students && this.normalizeRubricStudents(item.students) || [],
        title: item.title
      };
      return gradeItem;
    });
  }

  /**
   * @function normalizeGradeItemsForCourseMap
   * This method is used to normalize grade items for course map
   */
  private normalizeGradeItemsForCourseMap(payload) {
    return payload.map((item) => {
      const gradeItem = {
        collectionId: item.collectionId,
        collectionTitle: item.collectionTitle,
        collectionType: item.collectionType,
        lessonId: item.lessonId,
        lessonTitle: item.lessonTitle,
        studentCount: item.studentCount,
        unitId: item.unitId,
        unitTitle: item.unitTitle
      };
      return gradeItem;
    });
  }

  /**
   * @function normalizeRubricStudents
   * This method is used to normalize rubric students
   */
  private normalizeRubricStudents(payload): Array<RubricStudent> {
    return payload.map((item) => {
      const rubricStudent: RubricStudent = {
        email: item.email,
        firstName: item.firstName,
        id: item.id,
        lastName: item.lastName,
        thumbnail: item.thumbnail,
        username: item.username
      };
      return rubricStudent;
    });
  }

  /**
   * @function fetchRubricQuestionsItems
   * This method is used to fetch rubric questions
   */
  public fetchRubricQuestionsItems(params, isDca = true) {
    const dcaContent = isDca && `/${OA_TYPE.DCA}` || '';
    const endpoint = `${this.namespaceV2}${dcaContent}/rubrics/questions`;
    return this.httpService.get<Array<RubricQuestionItem>>(endpoint, params).then((result) => {
      return isDca
        ? this.normalizeRubricQuestionItems(result.data.gradeItems)
        : this.normalizeRubricQuestionItemsForCourseMap(result.data.gradeItems)
    });
  }

  /**
   * @function normalizeRubricQuestionItems
   * This method is used to normalize rubric question items
   */
  private normalizeRubricQuestionItems(payload): Array<RubricQuestionItem> {
    return payload.map((item) => {
      const rubricQuestionItem: RubricQuestionItem = {
        activationDate: item.activationDate,
        activityDate: item.activityDate,
        baseResourceId: item.baseResourceId,
        collectionId: item.collectionId,
        collectionTitle: item.collectionTitle,
        collectionType: item.collectionType,
        dcaContentId: item.dca_content_id,
        resourceId: item.resourceId,
        studentCount: item.studentCount,
        students: item.students && this.normalizeRubricStudents(item.students) || [],
        title: item.title
      };
      return rubricQuestionItem;
    });
  }

  /**
   * @function normalizeRubricQuestionItemsForCourseMap
   * This method is used to normalize rubric question for course map
   */
  private normalizeRubricQuestionItemsForCourseMap(payload) {
    return payload.map((item) => {
      const rubricQuestionItem = {
        baseResourceId: item.baseResourceId,
        collectionId: item.collectionId,
        collectionTitle: item.collectionTitle,
        collectionType: item.collectionType,
        lessonId: item.lessonId,
        lessonTitle: item.lessonTitle,
        resourceId: item.resourceId,
        studentCount: item.studentCount,
        title: item.title,
        unitId: item.unitId,
        unitTitle: item.unitTitle
      }
      return rubricQuestionItem;
    });
  }

  /**
   * @function getStudentsForQuestion
   * This method is used to get students for question
   */
  public getStudentsForQuestion(questionId, params, isDca) {
    const dcaContent = isDca && `/${OA_TYPE.DCA}` || '';
    const endpoint = `${this.namespaceV2}${dcaContent}/rubrics/questions/${questionId}/students`;
    return this.httpService.get<Array<string>>(endpoint, params).then((result) => {
      return result.data.students;
    });
  }

  /**
   * @function getAnswerToGrade
   * This method is used to get answer
   */
  public getAnswerToGrade(questionId, studentId, params, isDca) {
    const dcaContent = isDca && `/${OA_TYPE.DCA}` || '';
    const endpoint = `${this.namespaceV2}${dcaContent}/rubrics/questions/${questionId}/students/${studentId}/answers`;
    return this.httpService.get<AnswerToGradeForDCAModel>(endpoint, params).then((result) => {
      return this.normalizeAnswerGradeForDCA(result.data);
    });
  }

  /**
   * @function normalizeAnswerGradeForDCA
   * This method is used to normalize answer grade dca
   */
  public normalizeAnswerGradeForDCA(payload): AnswerToGradeForDCAModel {
    const answerGrade: AnswerToGradeForDCAModel = {
      answerText: this.normalizeAnswerText(payload.answerText),
      baseResourceId: payload.baseResourceId,
      collectionId: payload.collectionId,
      questionId: payload.questionId,
      questionText: payload.questionText,
      sessionId: payload.sessionId,
      submittedAt: payload.submittedAt,
      timeSpent: payload.timeSpent
    };
    return answerGrade;
  }

  /**
   * @function normalizeAnswerText
   * This method is used to normalize answer text
   */
  public normalizeAnswerText(payload): Array<AnswerTextModel> {
    return payload.map((item) => {
      const answerText: AnswerTextModel = {
        answerId: item.answerId,
        order: item.order,
        skip: item.skip,
        text: item.text,
        timeStamp: item.timeStamp
      };
      return answerText;
    });
  }

  /**
   * @function fetchRubric
   * This method is used to fetch Rubric items
   */
  public fetchRubric(rubricId) {
    const endpoint = `${this.namespace}/rubrics/${rubricId}`;
    return this.httpService.get<RubricModel>(endpoint, {}).then((result) => {
      return this.normalizeRubricById(result.data);
    });
  }

  /**
   * @function normalizeRubricById
   * This method is used to normalize rubric by id
   */
  public normalizeRubricById(payload): RubricModel {
    const rubric: RubricModel = {
      categories: payload.categories ? this.normalizeRubricCategory(payload.categories) : [],
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      description: payload.description,
      feedbackGuidance: payload.feedback_guidance,
      grader: payload.grader,
      gutCodes: payload.gut_codes,
      id: payload.id,
      isDeleted: payload.is_deleted,
      isRemote: payload.is_remote,
      isRubric: payload.is_rubric,
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCreatorId: payload.original_creator_id,
      originalRubricId: payload.original_rubric_id,
      overallFeedbackRequired: payload.overall_feedback_required,
      parentRubricId: payload.parent_rubric_id,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      publishStatus: payload.publish_status,
      taxonomy: payload.taxonomy,
      tenant: payload.tenant,
      tenantRoot: payload.tenant_root,
      thumbnail: payload.thumbnail,
      title: payload.title,
      updatedAt: payload.updatedAt,
      url: payload.url,
      visibleOnProfile: payload.visible_on_profile,
      maxScore: payload.max_score,
      scoring: payload.scoring,
      increment: payload.increment
    }
    return rubric;
  }

  /**
   * @function normalizeRubricCategory
   * This method is used to normalize rubric category
   */
  public normalizeRubricCategory(payload): Array<CategoriesModel> {
    return payload.map((item) => {
      const category: CategoriesModel = {
        categoryTitle: item.category_title,
        feedbackGuidance: item.feedback_guidance,
        levels: item.levels ? this.normalizeRubricLevels(item.levels) : [],
        requiresFeedback: item.required_feedback,
        allowsLevels: item.level,
        allowsScoring: item.scoring
      };
      return category;
    });
  }

  /**
   * @function normalizeRubricLevels
   * This method is used to normalize rubric levels
   */
  public normalizeRubricLevels(payload): Array<LevelModel> {
    return payload.map((item) => {
      const level: LevelModel = {
        levelName: item.level_name,
        score: Number(item.level_score),
        scoreInPrecentage: Number(item.level_score),
      }
      return level;
    });
  }

  /**
   * @function fetchFRQQuestions
   * This method is used to fetch FRQ questions
   */
  public fetchFRQQuestions(classId, courseId) {
    const endpoint = `${this.namespaceV2}/rubrics/questions`;
    const params = {
      classId,
      courseId
    };
    return this.httpService.get<Array<ItemToGradeQuestions>>(endpoint, params).then((result) => {
      return this.normalizeItemToGradeQuestions(result.data);
    });
  }

  /**
   * @function normalizeItemToGradeQuestions
   * Normalize the items to grade questions
   */
  private normalizeItemToGradeQuestions(question) {
    const questionsModel: ItemToGradeQuestions = {
      gradeItems: this.normalizeGradeItemsForQuestions(question.gradeItems),
      classId: question.classId,
      courseId: question.courseId
    };
    return questionsModel;
  }

  /**
   * @function normalizeGradeItemsForQuestions
   * Normalize the grade items for questions
   */
  private normalizeGradeItemsForQuestions(items) {
    return items.map((item) => {
      const gradeItemsModel: GradeItems = {
        lessonId: item.lessonId,
        unitId: item.unitId,
        lessonTitle: item.lessonTitle,
        unitTitle: item.unitTitle,
        collectionTitle: item.collectionTitle,
        collectionId: item.collectionId,
        collectionType: item.collectionType,
        resourceId: item.resourceId,
        title: item.title,
        studentCount: item.studentCount,
      };
      return gradeItemsModel;
    });
  }

  /**
   * @function submitOAGrade
   * method to submit oa grade
   */
  public submitOAGrade(oaRubric) {
    const teacherId = this.sessionService.userSession.user_id;
    Object.assign(oaRubric, {
      grader_id: teacherId
    });
    const endpoint = `${this.namespaceV2}/rubrics/grades/collections`;
    return this.httpService.post(endpoint, oaRubric);
  }

  /**
   * @function submitAssessmentGrade
   * method to submit assessment grade
   */
  public submitAssessmentGrade(assessmentRubric) {
    const endpoint = `${this.namespaceV2}/rubrics/grades`;
    return this.httpService.post(endpoint, assessmentRubric);
  }
}
