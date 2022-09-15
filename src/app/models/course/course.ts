import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { StudentAveragePerformanceModel } from '@models/performance/performance';
import { TaxonomyKeyModel } from '@models/taxonomy/taxonomy';
import { UnitSummaryModel } from '@models/unit/unit';

export interface CourseModel {
  id: string;
  subject: string;
  thumbnailUrl?: string;
  title: string;
  version: string;
  ownerId: string;
}

export interface CourseDetailModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  collaborator: string;
  createdAt: string;
  creatorId: string;
  creatorSystem: string;
  description: string;
  id: string;
  license: number;
  metadata: string;
  modifierId: string;
  originalCourseId: string;
  originalCreatorId: string;
  ownerId: string;
  primaryLanguage: string;
  publishDate: string;
  publishStatus: string;
  sequenceId: number;
  subjectBucket: string;
  taxonomy: TaxonomyKeyModel;
  thumbnail: string;
  title: string;
  units: Array<UnitSummaryModel>;
  updatedAt: string;
  useCase: string;
  version: string;
  visibleOnProfile: boolean;
}

export interface CourseMapUnitModel {
  lessonCount: number;
  performance: StudentAveragePerformanceModel;
  sequenceId: number;
  title: string;
  unitId: string;
  lessons?: Array<UnitLessonSummaryModel>;
}

export interface CourseStructureModel {
  id: string;
  title: string;
  children: Array<CourseStructureUnitModel>
}

export interface CourseStructureUnitModel {
  id: string;
  title: string;
  sequence: number;
  children: Array<CourseStructureLessonModel>
}

export interface CourseStructureLessonModel {
  id: string;
  title: string;
  sequence: number;
  children: Array<CourseStructureCollectionModel>;
}

export interface CourseStructureCollectionModel {
  id: string;
  title: string;
  sequence: number;
  format: string;
}
