import { CollectionsModel, ContentModel } from '@models/collection/collection';
import { RubricModel } from '@models/rubric/rubric';

export interface OaGradeItemModel {
  attempts: number;
  bidirectional: boolean;
  classroom_play_enabled: boolean;
  collectionSubType: string;
  courseId: string;
  authorEtlSecs: number;
  exemplar: string;
  format: string;
  id: string;
  isVisibleOnProfile: boolean;
  learningObjectives: string;
  lessonId: string;
  maxScore: number;
  ownerId: string;
  pathId: string;
  reference: string;
  references: Array<ReferenceModel>;
  studentRubric: RubricModel;
  teacherRubric: RubricModel;
  sequence: number;
  showFeedback: string;
  showKey: boolean;
  standards: Array<StandardModel>;
  subFormat: string;
  taskCount: number;
  tasks: Array<TaskModel>;
  thumbnailUrl: string;
  title: string;
  unitId: string;
  url: string;
}

export interface OaGradingItemModel {
  activityDate: string;
  classId: string;
  collection: CollectionsModel;
  content: ContentModel,
  contentType: string;
  dcaContentId: string;
  studentCount: number;
  subQuestionId?: string;
  courseId?: string;
  unitId?: string;
  lessonId?: string;
}

export interface GradeDetailsModel {
  classId: string;
  dcaContentId: number;
  collection: CollectionsModel;
  content: OaGradeItemModel;
  contentType: string;
  studentCount: number;
  collectionId?: string;
  activityDate?: string;
  isAssessmentGrading: boolean;
  isDCAContext: boolean;
  courseId?: string;
  lessonId?: string;
  unitId?: string;
}

export interface ReferenceModel {
  id: number;
  location: string;
  oaId: string;
  subType: string;
  type: string;
  name: string;
}

export interface StandardModel {
  code: string;
  description: string;
  frameworkCode: string;
  id: string;
  parentTitle: string;
  taxonomyLevel: string;
  title: string;
}

export interface TaskModel {
  description: string;
  id: number;
  oaId: string;
  oaTaskSubmissions: Array<OaTaskSubmissionModel>;
  submissionCount: number;
  title: string;
  submissions?: Array<SubmissionModel>;
  isSubmitted?: boolean;
  studentTaskSubmissions?: Array<StudentTaskSubmissionModel>;
  submissionText?: string;
}

export interface StudentTaskSubmissionModel {
  submissionIcon: string;
  submissionInfo: string;
  submissionSubtype: string;
  submissionType: string;
  submittedOn: string;
}

export interface OaTaskSubmissionModel {
  id: string;
  oaTaskId: string;
  taskSubmissionType: string;
  taskSubmissionSubType: string;
}

export interface SelectedCategoryModel {
  selectCategoryIndex: number;
  selectedLevel: SelectedLevelModel;
  selectedLevelIndex: number;
  allowsScoring: boolean;
  levelComments?: string;
}

export interface SelectedLevelModel {
  allowsScoring: boolean;
  categoryTitle: string;
  description: string;
  maxScore: number;
  name: string;
  score: number;
  scoreInPrecentage: number;
}
export interface TabsModel {
  title: string;
  isActive: boolean;
  contentType?: string;
}

export interface SubmissionsModel {
  tasks?: { taskId: number, submissions: SubmissionModel[] }[];
  sessionId?: string;
  oaRubrics?: {
    studentGrades?: OARubricGrade,
    teacherGrades?: OARubricGrade
  };
}

export interface SubmissionModel {
  freeFormText: SubmissionTypeModel[];
  uploaded: SubmissionTypeModel[];
  remote: SubmissionTypeModel[];
}
export interface SubmissionTypeModel {
  submissionIcon: string;
  submissionInfo: string;
  submissionSubtype: string;
  submissionType: string;
  submittedOn: string;
}

export interface OARubricGrade {
  rubricId?: string;
  timeSpent?: number;
  studentScore?: number;
  maxScore?: number;
  overallComment?: string;
  grader?: string;
  submittedOn?: string;
  categoryScore?: number;
  scoreInPercentage?: number;
}

export interface TaskFileUpload {
  uuidName: string;
  fileType: string;
  isUploaded?: boolean;
  isUploading?: boolean;
}

export class OAStudentModelForReport {
  public email: string;
  public firstName: string;
  public id: string;
  public isActive: boolean;
  public lastName: string;
  public username: string;
  public thumbnail: string;
  public performance: OAStudentPerformanceForReport;

  constructor() {
    this.email = '';
    this.firstName = '';
    this.id = '';
    this.isActive = false;
    this.lastName = '';
    this.username = '';
    this.thumbnail = '';
    this.performance = {
      taskCount: 0,
      timespent: 0,
      completedTask: 0,
      score: null
    }
  }
}

export class OAStudentPerformanceForReport {
  public taskCount: number;
  public timespent: number;
  public completedTask: number;
  public score: number;

  constructor() {
    this.taskCount = 0;
    this.timespent = 0;
    this.completedTask = 0;
    this.score = null;
  }
}















