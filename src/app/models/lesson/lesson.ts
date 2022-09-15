import { UnitCollectionSummaryModel } from '@models/collection/collection';
import { CourseMapPerformanceContentModel } from '@models/performance/performance';
import { TaxonomyKeyModel } from '@models/taxonomy/taxonomy';

export interface MilestoneLessonListModel {
  courseId: string;
  lessons: Array<LessonModel>;
  milestoneId: string;
}

export interface LessonModel {
  fwCode: string;
  gradeId: number;
  gradeName: string;
  gradeSeq: number;
  lessonId: string;
  lessonSequence: number;
  lessonTitle: string;
  title?: string;
  txCompCode: string;
  txCompName: string;
  txCompSeq: number;
  txCompStudentDesc: string;
  txDomainCode: string;
  txDomainId: number;
  txDomainName: string;
  txDomainSeq: number;
  txSubjectCode: string;
  unitId: string;
  unitSequence: number;
  isLastLesson?: boolean;
  isFirstSystemSuggested?: boolean;
  isFirstTeacherSuggested?: boolean;
  isRescoped?: boolean;
  isFirstSuggestedCollection?: boolean;
  firstSuggestedPathType?: string;
  unitTitle: string;
  isCurrentLesson?: boolean;
  performance?: CourseMapPerformanceContentModel;
  collections?: Array<UnitCollectionSummaryModel>;
}

export interface UnitLessonContentModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  bigIdeas: string;
  courseId: string;
  createdAt: string;
  creatorId: string;
  creatorSystem: string;
  essentialQuestions: string;
  lessons: Array<UnitLessonSummaryModel>;
  metadata: string;
  modifierId: string;
  originalCreatorId: string;
  originalUnitId: string;
  ownerId: string;
  primaryLanguage: number;
  sequenceId: number;
  taxonomy: TaxonomyKeyModel;
  title: string;
  unitId: string;
  updatedAt: string;
}

export interface UnitLessonSummaryModel {
  assessmentCount: number;
  collectionCount: number;
  externalAssessmentCount: number;
  externalCollectionCount: number;
  lessonId: string;
  oaCount: number;
  sequenceId: number;
  title: string;
  collections?: Array<UnitCollectionSummaryModel>;
  isCurrentLesson?: boolean;
}
export interface UnitLessonPerformance {
  attemptStatus: string;
  attempts: number;
  completedCount: number;
  reaction: number;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  lessonId: string;
}
