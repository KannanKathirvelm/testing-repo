import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { CourseMapPerformanceContentModel } from '@models/performance/performance';

export interface UnitSummaryModel {
  lessonCount: number;
  sequenceId: number;
  title: string;
  unitId: string;
  lessons?: Array<UnitLessonSummaryModel>;
  performance?: CourseMapPerformanceContentModel;
  isCurrentUnit?: boolean;
  isUnit0?: boolean;
}
