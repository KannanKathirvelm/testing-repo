import { LessonModel } from '@models/lesson/lesson';
import { MilestoneModel } from '@models/milestone/milestone';
import { createAction, props } from '@ngrx/store';
export const setMilestone = createAction('[Milestone] SetMilestone', props<{ key: string; data: Array<MilestoneModel> }>());
export const setMilestoneLesson = createAction('[Milestone Lesson] SetMilestoneLesson', props<{ key: string; data: Array<LessonModel> }>());
