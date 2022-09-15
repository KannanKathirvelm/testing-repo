import { CAOverallPerformanceModel } from '@models/performance/performance';
import { CASuggestionModel } from '@models/suggestion/suggestion';
import { TaxonomyKeyModel, TaxonomyStandardModel } from '@models/taxonomy/taxonomy';
import { ContentModel } from '../collection/collection';

export interface ClassContentModel {
  activationDate?: string;
  allowMasteryAccrual: boolean;
  activityClasses?: Array<ClassContentForMultiClassModel>;
  classId: string;
  contentId: string;
  collection: Collection;
  contentType: string;
  createdAt: string;
  dcaAddedDate: string;
  endDate: string;
  forMonth: number;
  forYear: number;
  id: number;
  isCompleted: boolean;
  isDiagnostic?: boolean;
  meetingEndTime?: string;
  meetingId?: string;
  meetingStartTime?: string;
  meetingTimezone?: string;
  meetingUrl?: string;
  taskCount?: number;
  taxonomy: TaxonomyKeyModel;
  thumbnail: string;
  title: string;
  url?: string;
  usersCount: number;
  learningObjective?: string;
  resourceCount?: number;
  questionCount?: number;
  ownerId?: string;
  thumbnailXS?: string;
  showMastery: boolean;
  videoConferenceEnable?: boolean;
  isActive: boolean;
  isAssessment?: boolean;
  isCollection?: boolean;
  isExternalAssessment?: boolean;
  isExternalCollection?: boolean;
  isOfflineActivity?: boolean;
  isMeeting?: boolean;
  performance?: CAOverallPerformanceModel;
  standards?: Array<TaxonomyStandardModel>;
}

export interface ClassContentForMultiClassModel {
  activationDate: string;
  classId: string;
  code: string;
  content: Collection;
  contentId: string;
  contentType: string;
  id: number;
  isActive: boolean;
  isAssessment: boolean;
  isCollection: boolean;
  isCompleted: boolean;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isMeeting: boolean;
  isOfflineActivity: boolean;
  taxonomy: any;
  thumbnail: string;
  thumbnailXS: string;
  title: string;
  usersCount: number;
  meetingEndTime?: string;
  meetingId?: string;
  meetingStartTime?: string;
  meetingTimezone?: string;
  meetingUrl?: string;
}

export interface CAPerformanceModel {
  classId: string;
  completedCount: number;
  scoreInPercentage: number;
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

export interface RubricItems {
  gradeItems?: Array<GradeItems>;
  classId: string;
}

export interface ClassActivity {
  activationDate: string;
  dcaAddedDate?: string;
  addedDate: string;
  allowMasteryAccrual: boolean;
  classId: string;
  collection: Collection;
  contentId: string;
  contentType: string;
  endDate: string;
  forMonth: number;
  forYear: number;
  id: number;
  isCompleted: boolean;
  questionCount: number;
  resourceCount: number;
  taskCount: number;
  thumbnail: string;
  title: string;
  url: string;
  meeting_endtime: string;
  meeting_starttime: string;
  meeting_timezone: string;
  meeting_url: string;
  usersCount?: number;
  isAssessment?: boolean;
  isCollection?: boolean;
  isExternalAssessment?: boolean;
  isExternalCollection?: boolean;
  suggestion?: CASuggestionModel;
}

export interface Collection {
  collectionType: string;
  format: string;
  id: string;
  thumbnailUrl: string;
  defaultImg: string;
  title: string;
  url: string;
  description?: string;
  resourceCount?: number;
  questionCount?: number;
  oeQuestionCount?: number;
  taskCount?: number;
  performance?: Performance;
}

export interface Performance {
  attempts: string;
  collectionId: string;
  id: string;
  pathId: string;
  score: number;
  sessionId: string;
  status: string;
  timeSpent: number;
  views: number;
  hasStarted?: boolean;
}

export interface CAStudentList {
  email: string;
  firstName: string;
  id: string;
  isActive: boolean;
  lastName: string;
  rosterGlobalUserid: string;
  username: string;
  thumbnail: string;
  performance?: CAStudentPerformance;
  questions?: Array<ContentModel>;
  isSelected?: boolean;
  performanceScore?: number;
  timeSpent?: number;
}

export interface CAStudentPerformance {
  [key: number]: CAContentPerformanceModel;
  usageData: Array<CAStudentPerformanceUsage>;
  userUid: string;
}

export interface CAContentPerformanceModel {
  collectionType: string;
  reaction: number;
  score: number;
  timespent: number;
  lastSessionId?: string;
}

export interface CAStudentPerformanceUsage {
  answerObject: Array<CAStudentAnswerObj>;
  eventTime: number;
  evidence: any;
  gooruOId: string;
  isGraded: boolean;
  maxScore: number;
  questionType: string;
  rawScore: number;
  reaction: number;
  resourceType: string;
  score: number;
  timeSpent: number;
  sessionId: string;
  views: number;
  status?: string;
}

export interface CAStudentAnswerObj {
  answerId: string;
  order: number;
  skip: boolean;
  status: string;
  text: string;
  timeStamp: number;
  answer_text?: string;
}
