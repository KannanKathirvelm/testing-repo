import { ProfileModel } from '@models/profile/profile';

export interface PerformanceModel {
  classId: string;
  id: string;
  score: number;
  sessionId: string;
  timeSpent: number;
  total: number;
  totalCompleted: number;
  scoreInPercentage?: number;
}

export interface CAPerformanceModel {
  classId: string;
  completedCount: number;
  scoreInPercentage: number;
}

export interface CollectionSessionModel {
  eventTime: string;
  sequence: number;
  sessionId: string;
}

export interface AnalyticsModel {
  classId: string;
  collectionId: string;
  collectionTitle: string;
  collectionType: string;
  courseId: string;
  lessonId: string;
  pathId: string;
  pathType: string;
  status: string;
  unitId: string;
}

export interface StudentAveragePerformanceModel {
  averageScore: number;
  studentsCount: number;
  timespent: number;
}

export interface CourseMapPerformanceModel {
  attemptStatus: string;
  attempts: number;
  completedCount: number;
  reaction: number;
  scoreInPercentage: number;
  timespent: number;
  totalCount: number;
  unitId?: string;
  lessonId?: string;
  assessmentId?: string;
  collectionId?: string;
}

export interface QuestionPerformanceModel {
  reaction: number;
  scoreInPercentage: number;
  timespent: number;
  totalCount: number;
  contenId: string;
  isCorrect: boolean;
  resourceType: string;
  isResource: boolean;
  isQuestion: boolean;
}

export interface CollectionPerformanceContentModel {
  performance: QuestionPerformanceModel;
  contenId: string;
  userUid: string;
}

export interface CourseMapPerformanceContentModel {
  performance: CourseMapPerformanceModel;
  unitId?: string;
  lessonId?: string;
  assessmentId?: string;
  averageScore?: number;
  scoreInPercentage?: number;
  collectionId?: string;
  user: ProfileModel;
  userUid: string;
}

export interface MilestonePerformanceModel {
  attemptStatus: string;
  attempts: number;
  completedCount: number;
  reaction: number;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  milestoneId?: string;
  lessonId?: string;
  assessmentId?: string;
  collectionId?: string;
}

export interface MilestonePerformanceContentModel {
  performance: CourseMapPerformanceModel;
  unitId?: string;
  milestoneId?: string;
  lessonId?: string;
  assessmentId?: string;
  collectionId?: string;
  user: ProfileModel;
  userUid: string;
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

export interface CAOverallPerformanceModel {
  attempts: number;
  collectionId: string;
  hasStarted: boolean;
  score: number;
  sessionId: string;
  timeSpent: number;
}

export interface CaAggregratePerformanceModel {
  activationDate: string;
  collectionPerformanceSummary: CAOverallPerformanceModel;
  date: Date;
}

export interface EvidenceModel {
  filename: string;
  originalFileName: string;
  url?: string;
}
