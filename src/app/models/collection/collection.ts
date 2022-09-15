import { SafeUrl } from '@angular/platform-browser';
import { CAStudentAnswerObj, CAStudentPerformance } from '@models/class-activity/class-activity';
import { LessonModel } from '@models/lesson/lesson';
import { TaxonomyKeyModel } from '@models/taxonomy/taxonomy';

export interface CollectionsModel {
  id: string;
  url: string;
  collaborator: Array<string>;
  content: Array<ContentModel>;
  courseId: string;
  creatorId: string;
  format: string;
  grading: string;
  learningObjective: string;
  lessonId: string;
  license: string;
  originalCollectionId: string;
  originalCreatorId: string;
  ownerId: string;
  primaryLanguage: number;
  publishDate: string;
  thumbnail: string;
  title: string;
  unitId: string;
  visibleOnProfile: boolean;
  settings: CollectionSettings;
  taxonomy: any;
  questionCount?: number;
  collectionType?: string;
  suggestionType?: string;
  isSuggested?: boolean;
  isCollection: boolean;
  isAssessment: boolean;
  gutCodes?: Array<string>;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  lesson?: LessonModel;
  isNextLesson?: boolean;
}

export interface CollectionModel {
  format: string;
  id: string;
  oeQuestionCount?: number;
  questionCount?: number;
  resourceCount?: number;
  learningObjective?: string;
  sequenceId?: number;
  taskCount?: number;
  thumbnail: string;
  thumbnailXS?: string;
  title: string;
  url?: string;
  isLastCollectionInLesson?: boolean;
  isLastCollectionInMilestone?: boolean;
  isSuggestedContent?: boolean;
  isNextSuggestedCollection?: boolean;
  isNextSystemSuggested?: boolean;
  iSystemSuggested?: boolean;
  isTeacherSuggested?: boolean;
  isNextTeacherSuggested?: boolean;
  nextCollectionPathType?: string;
  pathType?: string;
  isCurrentCollection?: boolean;
  performance?: CollectionPerformanceUsageDataModel;
}

export interface CollectionSettings {
  attemptsAllowed: number;
  bidirectionalPlay: boolean;
  classroomPlayEnabled: boolean;
  contributesToMastery: boolean;
  contributesToPerformance: boolean;
  randomizePlay: boolean;
  showExplanation: boolean;
  showFeedback: string;
  showHints: boolean;
  showKey: string;
}

export interface ContentModel {
  type?: string;
  answer?: Array<AnswerModel>;
  answerObject?: Array<CAStudentAnswerObj>;
  statusObject?: Array<string>;
  contentFormat?: string;
  contentSubformat?: string;
  creatorId?: string;
  description?: string;
  hintExplanationDetail?: string;
  id?: string;
  isCopyrightOwner?: boolean;
  isPerformed?: boolean;
  maxScore?: number;
  narration?: string;
  originalCreatorId?: string;
  publishDate?: string;
  sequenceId?: number;
  taxonomy?: any;
  standard?: any;
  thumbnail?: string;
  title?: string;
  s3Url?: string;
  url?: string;
  scoreStatus?: number;
  performByAddData?: boolean;
  subQuestions?: Array<AnswerModel>;
  visibleOnProfile?: boolean;
  creator?: {
    firstName: string;
    gooruUId: string;
    lastName: string;
    profileImageUrl: string;
    username: string;
    usernameDisplay: string;
  };
  player_metadata?: {
    additional_attributes: { hard_text: string, soft_text: string };
  };
}

export interface AnswerModel {
  answer_text?: string;
  answer_type?: string;
  highlight_type?: string;
  is_correct?: number;
  sequence?: number;
  user_selected?: number;
  selected?: boolean;
  status?: string;
  userAnswerText?: string;
  correct_answer?: Array<string>;
  struggles?: Array<StrugglesModel>;
  text?: string;
  audioUrl?: SafeUrl;
  audioBlob?: Blob;
  answer_audio_filename?: string;
  answerInLetters?: Array<string>;
  order?: number;
  isNotSorted?: boolean;
  contentFormat?: string;
  contentSubformat?: string;
  id?: string;
  answerStatus?: string;
}

export interface CompetencyModel {
  id: string;
  standard?: any;
}

export interface StrugglesModel {
  manifest_comp_code: string;
  origin_comp_code: string;
  struggle_code: string;
  subject_code: string;
}

export interface CollectionPerformanceUsageDataModel {
  attemptStatus: string;
  collectionId: string;
  completedCount: number;
  gradingStatus: string;
  score: number;
  reaction: number;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  views: number;
}

export interface UnitCollectionContentModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  collections?: Array<UnitCollectionSummaryModel>;
  collectionSummary?: Array<UnitCollectionSummaryModel>;
  courseId: string;
  createdAt: string;
  creatorId: string;
  format?: string;
  lessonPlan?: string;
  creatorSystem: string;
  lessonId: string;
  metadata: string;
  modifierId: string;
  originalCreatorId: string;
  originalLessonId: string;
  ownerId: string;
  primaryLanguage: number;
  sequenceId: number;
  taxonomy: any;
  title: string;
  unitId: string;
  updatedAt: string;
  subQuestions?: Array<AnswerModel>;
}

export interface CollectionListModel {
  alternatePaths: {
    teacherSuggestions: Array<CollectionSuggestionModel>;
    systemSuggestions: Array<CollectionSuggestionModel>
  };
  coursePath?: UnitCollectionContentModel;
}

export interface CollectionSuggestionModel {
  id: string;
  title: string;
  format: string;
  collectionId: string;
  classId: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  pathId: number;
  ctxPathId?: number;
  ctxPathType?: string;
  pathType: string;
  resourceCount: number;
  contentSubFormat: string;
  source: string;
  thumbnail: string;
  thumbnailXS?: string;
  isRescoped?: boolean;
  isSuggestedContent: true;
  isCollection: boolean;
  isAssessment: boolean;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isOfflineActivity: boolean;
}

export interface UnitCollectionSummaryModel {
  format: string;
  id: string;
  oeQuestionCount?: number;
  questionCount?: number;
  resourceCount?: number;
  sequenceId?: number;
  isRescoped?: boolean;
  taskCount?: number;
  subformat?: string;
  thumbnail: string;
  thumbnailXS?: string;
  title: string;
  url?: string;
  learningObjective?: string;
  isLastCollectionInLesson?: boolean;
  isLastCollectionInMilestone?: boolean;
  isSuggestedContent?: boolean;
  isNextSuggestedCollection?: boolean;
  isNextSystemSuggested?: boolean;
  iSystemSuggested?: boolean;
  isTeacherSuggested?: boolean;
  isNextTeacherSuggested?: boolean;
  nextCollectionPathType?: string;
  pathType?: string;
  isCurrentCollection?: boolean;
  performance?: UnitCollectionPerformance;
  isAssessment: boolean;
  isCollection: boolean;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isOfflineActivity: boolean;
  gutCodes?: Array<string>;
  metadata?: FluencyContentModel;
}

export interface FluencyContentModel {
  fluencyCode: string;
  fluencyDescription: string;
  fluencyDisplayCode: string;
  fluencySequence: number;
}

export interface UnitCollectionPerformance {
  attemptStatus: string;
  collectionId: string;
  completedCount: number;
  gradingStatus: string;
  reaction: number;
  scoreInPercentage: number;
  timeSpent?: number;
  totalCount: number;
  timespent?: number;
}

export class CollectionQuestionAddDataModel {
  public contentFormat: string;
  public contentSubformat: string;
  public creatorId: string;
  public description: string;
  public id: string;
  public title: string;
  public hours: number;
  public minutes: number;
  public timespent?: number;
  public isExpanded: boolean;
  public type: string;
  constructor() {
    this.contentFormat = '';
    this.contentSubformat = '';
    this.creatorId = '';
    this.description = '';
    this.id = '';
    this.title = '';
    this.hours = 0;
    this.minutes = 0;
    this.isExpanded = false;
    this.type = '';
  }
}

export class AssessmentStudentAddDataModel {
  public username: string;
  public isActive: boolean;
  public id: string;
  public thumbnail: string;
  public isExpanded: boolean;
  public content?: Array<AssessmentQuestionContentForAddData>;
  public isSubmitted: boolean;
  public performance?: CAStudentPerformance;
  public isSavePending?: boolean;
  public firstName: string;
  public lastName: string;

  constructor() {
    this.username = '';
    this.isActive = false;
    this.id = '';
    this.thumbnail = '';
    this.isExpanded = false;
    this.content = [];
    this.isSubmitted = false;
    this.performance = null;
    this.isSavePending = false;
    this.firstName = '';
    this.lastName = '';
  }
}

export class AssessmentQuestionContentForAddData {
  public answer: Array<AssessmentAnswerContentForAddData>;
  public contentFormat: string;
  public questionType: string;
  public description: string;
  public id: string;
  public title: string;
  public sequenceId: number;
  public taxonomy: any;
  public maxScore: number;
  public score: number;
  public isExpanded: boolean;
  public scoreInPercentage: number;

  constructor() {
    this.answer = [];
    this.contentFormat = '';
    this.questionType = '';
    this.description = '';
    this.id = '';
    this.title = '';
    this.sequenceId = 0;
    this.taxonomy = null;
    this.maxScore = 0;
    this.score = 0;
    this.isExpanded = false;
    this.scoreInPercentage = null;
  }
}

export class AssessmentAnswerContentForAddData {
  public answer_text: string;
  public answerType: string;
  public highlightType: string;
  public isCorrect: number;
  public sequence: number;

  constructor() {
    this.answer_text = '';
    this.answerType = '';
    this.highlightType = null;
    this.isCorrect = 0;
    this.sequence = 0;
  }
}

export interface CrossWalkFrameWorkModel {
  sourceDisplayCode: string;
  sourceTaxonomyCodeId: string;
  targetDisplayCode: string;
}
