import { CollectionPerformanceUsageDataModel } from '@models/performance/performance';

export interface Route0ContentModel {
  createdAt: number;
  route0Content: {
    milestones: Array<Route0MilestonesModel>
  };
  status: string;
}

export interface Route0MilestonesModel {
  lessons: Array<Route0LessonsModel>;
  milestoneId: number;
  sequenceId: number;
  milestoneTitle: string;
  isRoute0: boolean;
}

export interface Route0LessonsModel {
  collections: Array<Route0CollectionsModel>;
  isPerformance?: boolean;
  lessonId: string;
  lessonSequence: number;
  lessonTitle: string;
  unitId: string;
  txCompCode: string;
  unitTitle: string;
  unitSequence: number;
  isCurrentLesson?: boolean;
}

export interface Route0CollectionsModel {
  id: string;
  collectionSequence: number;
  collectionType: string;
  pathId: number;
  format: string;
  title: string;
  thumbnailXS: string;
  performance?: CollectionPerformanceUsageDataModel;
}
