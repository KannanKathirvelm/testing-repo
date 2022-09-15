import { CollectionListModel } from '@models/collection/collection';
import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { UnitSummaryModel } from '@models/unit/unit';
import { createAction, props } from '@ngrx/store';
export const setUnit = createAction('[Course Unit] SetUnit', props<{ key: string; data: Array<UnitSummaryModel> }>());
export const setUnitLesson = createAction('[Unit Lesson] SetUnitLesson', props<{ key: string; data: Array<UnitLessonSummaryModel> }>());
export const setLessonCollection = createAction('[Lesson Collection] setLessonCollection', props<{ key: string; data: CollectionListModel }>());
