import { LessonModel } from '@models/lesson/lesson';
import { CourseMapPerformanceContentModel } from '@models/performance/performance';
import { ProfileModel } from '@models/profile/profile';
import { TaxonomyKeyModel } from '@models/taxonomy/taxonomy';

export interface MilestoneCourseParamsModel {
  classId: string;
  courseId: string;
  fwCode?: string;
  studentList: Array<ProfileModel>,
  isTeacherView?: boolean;
  milestoneId?: string;
  lessonId?: string;
  unitId?: string;
  contentType?: string;
  contentId?: string;
}

export interface MilestoneListModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  collaborator?: Array<string>;
  createdAt?: string;
  creatorId: string;
  creatorSystem: string;
  description: string;
  id: string;
  license?: string;
  metadata?: Array<any>;
  milestones: Array<MilestoneModel>;
  modifierId: string;
  originalCourseId: string;
  originalCreatorId: string;
  ownerId: string;
  primaryLanguage: number;
  publishDate?: string;
  publishStatus: string;
  sequenceId: number;
  subjectBucket: string;
  taxonomy: TaxonomyKeyModel;
  thumbnail?: string;
  title: string;
  updatedAt?: string;
  useCase: string;
  version: string;
  visibleOnProfile: boolean;
}

export interface MilestoneModel {
  gradeId: number;
  gradeName: string;
  gradeSeq: number;
  milestoneId: string;
  txSubjectCode: string;
  performance?: CourseMapPerformanceContentModel;
  lessons?: Array<LessonModel>;
  isCurrentMilestone?: boolean;
  sequenceId: number;
  isLessonLoaded?: boolean;
  isRescoped?: boolean;
  isUnit0?: boolean;
}

export interface SkippedContentModel {
  assessments: Array<string>;
  assessmentsExternal: Array<string>;
  collections: Array<string>;
  collectionsExternal: Array<string>;
  lessons: Array<string>;
  units: Array<string>;
}

export interface MilestoneByDateModel {
  competencyCount: number;
  domainCount: number;
  gradeId: number;
  gradeName: string;
  gradeSeq: number;
  milestoneId: string;
  students: Array<MilestoneOfStudentByDateModel>;
  topicCount: number;
  milestoneSeq: number;
  title?: string;
}

export interface MilestoneOfStudentByDateModel {
  averageScore: number;
  completedCompetencies: number;
  firstName: string;
  highestCompetency: string;
  highestCompetencyTitle: string;
  id: string;
  lastName: string;
  thumbnail: string;
  totalCompetencies: number;
}
