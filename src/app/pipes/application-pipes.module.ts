import { NgModule } from '@angular/core';
import { CharLength } from '@pipes/charLength.pipe';
import { CheckToShowEmailPipe } from '@pipes/check-to-show-email.pipe';
import { CompetencyGutToFwTransform } from '@pipes/competency-gut-to-fw-transform.pipe';
import { DomainGutToFwTransform } from '@pipes/domain-gut-to-fw-transform.pipe';
import { ListFilterPipe } from '@pipes/list-filter.pipe';
import { ShowAnswerStatusPipe } from '@pipes/showAnswerStatus.pipe';
import { SortByPipe } from '@pipes/sort-by.pipe';
import { TransformGradeColor } from '@pipes/transform-grade-color.pipe';
import { TransformCompetencyStats } from '@pipes/transformCompentencyStats.pipe';
import { CheckIsNullPipe } from './check-is-null.pipe';
import { CheckIsUndefinedPipe } from './check-is-undefined.pipe';
import { TransformDomainPercentagePipe } from './find-domain-percentage.pipe';
import { FormatDate } from './formatDate.pipe';
import { GradeRangePipe } from './grade-range.pipe';
import { IterateObjectPipe } from './itterate-object.pipe';
import { TransformCompentencyStats } from './transform-compentency-stats.pipe';
import { TransformPerformanceScorePipe } from './transform-performance-score.pipe';
import { TransformScorePipe } from './transform-score.pipe';
import { TransformTimeSpent } from './transform-timespent.pipe';

const PIPES = [
  DomainGutToFwTransform,
  ListFilterPipe,
  GradeRangePipe,
  TransformScorePipe,
  CompetencyGutToFwTransform,
  TransformTimeSpent,
  CharLength,
  TransformDomainPercentagePipe,
  FormatDate,
  TransformGradeColor,
  ShowAnswerStatusPipe,
  TransformCompentencyStats,
  IterateObjectPipe,
  TransformCompetencyStats,
  TransformPerformanceScorePipe,
  SortByPipe,
  CheckToShowEmailPipe,
  CheckIsUndefinedPipe,
  CheckIsNullPipe
];

@NgModule({
  declarations: [PIPES],
  exports: [PIPES]
})
export class ApplicationPipesModule { }
