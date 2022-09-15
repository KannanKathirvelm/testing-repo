import { TaskModel } from '@models/offline-activity/offline-activity';

export class OaStudentRubric {
  public id: string;
  public teacherRubric: OaStudentRubricModel;
  public name: string;
  public thumbnail?: string;
  public isActive?: boolean;
  public studentRubric?: OaStudentRubricModel;
  public frqQa?: FrqQuestionAnswerModel;
  public activityTasks?: Array<TaskModel>;

  constructor() {
    this.id = '';
    this.name = '';
    this.thumbnail = '';
    this.isActive = false;
    this.teacherRubric = null;
    this.studentRubric = null;
    this.frqQa = null;
    this.activityTasks = [];
  }
}

export class OaStudentRubricModel {
  public categories: Array<OaRubricCategoryModel>;
  public increment: number;
  public maxScore: number;
  public scoring: boolean;
  public title: string;
  public uploaded: boolean;
  public url: string;
  public gradedScore: number;
  public grader: boolean;
  public comment?: string;
  public id: string;
  public isTeacherRubric: boolean;
  public tenant: string;
  public taxonomy: any;
  public parentRubricId: string;
  public originalRubricId: string;
  public originalCreatorId: string;
  public modifierId: string;
  public gradedScoreInPercentage: number;
  public isRubric: boolean;
  public creatorId: string;

  constructor() {
    this.categories = [];
    this.increment = 0;
    this.maxScore = 0;
    this.scoring = false;
    this.title = '';
    this.uploaded = false;
    this.url = '';
    this.gradedScore = 0;
    this.grader = false;
    this.comment = '';
    this.id = '';
    this.isTeacherRubric = false;
    this.tenant = null;
    this.taxonomy = null;
    this.parentRubricId = '';
    this.originalRubricId = '';
    this.originalCreatorId = '';
    this.modifierId = '';
    this.gradedScoreInPercentage = null;
    this.isRubric = false;
    this.creatorId = '';
  }
}

export class OaRubricCategoryModel {
  public allowsLevels: boolean;
  public allowsScoring: boolean;
  public comment: string;
  public feedbackGuidance: string;
  public levels: Array<OaStudentRubricLevelModel>;
  public requiresFeedback: boolean;
  public title: string;
  public teacherGradedScore: number;
  public maxScore: number;
  public scoreInPercentage: number;

  constructor() {
    this.allowsLevels = false;
    this.allowsScoring = false;
    this.comment = '';
    this.feedbackGuidance = null;
    this.levels = [];
    this.requiresFeedback = false;
    this.title = '';
    this.teacherGradedScore = 0;
    this.scoreInPercentage = null;
    this.maxScore = 0;
  }
}

export class OaStudentRubricLevelModel {
  public description: string;
  public name: string;
  public score: number;
  public scoreInPercentage: number;
  public isChecked?: boolean;

  constructor() {
    this.description = '';
    this.name = '';
    this.score = 0;
    this.scoreInPercentage = null;
    this.isChecked = false;
  }
}

export class FrqQuestionAnswerModel {
  public questionId: string;
  public questionDesc: string;
  public answerText: Array<FrqAnswerModel>;
  public sessionId: string;

  constructor() {
    this.questionId = '';
    this.questionDesc = '';
    this.answerText = [];
    this.sessionId = '';
  }
}

export class FrqAnswerModel {
  public answerId: string;
  public order: number;
  public skip: boolean;
  public text: string;
  public timeStamp: number;

  constructor() {
    this.answerId = '';
    this.order = 0;
    this.skip = false;
    this.text = '';
    this.timeStamp = 0;
  }
}

export interface GradeItem {
  classId?: string;
  activationDate: string;
  collectionId: string;
  collectionType: string;
  dcaContentId: number;
  studentCount: number;
  students: Array<RubricStudent>;
  title: string;
  resourceId?: string;
  baseResourceId?: string;
  activityDate?: string;
  collectionTitle?: string;
  subQuestionId?: string;
}

export interface RubricStudent {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  thumbnail: string;
  username: string;
}

export interface RubricQuestionItem {
  classId?: string;
  activationDate: string;
  activityDate: string;
  baseResourceId: string;
  collectionId: string;
  collectionTitle: string;
  collectionType: string;
  dcaContentId: number;
  resourceId: string;
  studentCount: number;
  students: Array<RubricStudent>;
  title: string;
}

export interface RubricGroupingModel {
  activityId: string;
  contentId: string;
  contentType: string;
  gradingClasses: Array<GradingClassModel>;
  resourceId: string;
  subQuestionId?: string;
  questions?: any;
}

export interface GradingClassModel {
  activityDate: string;
  code: string;
  id: string;
  studentCount: number;
  title: string;
}

export interface AnswerToGradeForDCAModel {
  answerText: Array<AnswerTextModel>;
  baseResourceId: string;
  collectionId: string;
  questionId: string;
  questionText: string;
  sessionId: string;
  submittedAt: string;
  timeSpent: number;
}

export interface AnswerTextModel {
  answerId: string;
  order: number;
  skip: boolean;
  text: string;
  timeStamp: number;
}

export interface RubricModel {
  categories: Array<CategoriesModel>;
  createdAt: string;
  creatorId: string;
  creatorSystem: string;
  description: string;
  feedbackGuidance: string;
  grader: string;
  gutCodes: Array<string>;
  id: string;
  isDeleted: boolean;
  isRemote: boolean;
  isRubric: boolean;
  metadata: string;
  modifierId: string;
  originalCreatorId: string;
  originalRubricId: string;
  overallFeedbackRequired: boolean;
  parentRubricId: string;
  primaryLanguage: number;
  publishDate: string;
  publishStatus: string;
  taxonomy: any;
  tenant: string;
  tenantRoot: string;
  thumbnail: string;
  title: string;
  updatedAt: string;
  url: string;
  visibleOnProfile: boolean;
  studentScore?: number;
  categoriesScore?: Array<{
    title: string;
    levelMaxScore: number;
    levelComment: string;
    levelObtained?: string;
    score?: number;
    totalPoints?: number
  }>;
  sessionId?: string;
  eventName?: string;
  activityDate?: string;
  contentSource?: string;
  collectionType?: string;
  updatedDate?: Date;
  maxScore?: number;
  scoring?: boolean;
  uploaded?: boolean;
  increment?: number;
  comment?: string;
}

export interface CategoriesModel {
  allowsLevels: boolean;
  allowsScoring: boolean;
  feedbackGuidance: string;
  levels: Array<LevelModel>;
  requiresFeedback: boolean;
  categoryTitle: string;
  maxScore?: number;
  comment?: string;
  scoreInPrecentage?: number;
  totalPoints?: number;
}

export interface LevelModel {
  levelName: string;
  score: number;
  description?: string;
  scoreInPrecentage: number;
  isSelected?: boolean;
  comments?: string;
  isChecked?: boolean;
}

export interface SelectedLevelModel {
  level: LevelModel;
  levelIndex: number;
  allowsScoring?: boolean;
}

export interface ItemToGradeQuestions {
  gradeItems?: Array<GradeItems>;
  classId: string;
  courseId: string;
}

export interface GradeItems {
  lessonId: string;
  unitId: string;
  lessonTitle: string;
  unitTitle: string;
  collectionTitle: string;
  collectionId: string;
  collectionType: string;
  resourceId: string;
  title: string;
  studentCount: number;
}
