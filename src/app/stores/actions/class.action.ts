import { ClassMembersGrade, ClassModel } from '@models/class/class';
import { CourseModel } from '@models/course/course';
import { createAction, props } from '@ngrx/store';
export const setClassMembers = createAction('[ClassMembers] SetClassMembers',
  props<{ key: string; data: Array<ClassMembersGrade> }>()
);
export const setActiveClass = createAction('[ActiveClass] SetActiveClass',
  props<{ key: string; data: Array<ClassModel> }>()
);
export const setActiveClassCourse = createAction('[ActiveClassCourse] SetActiveClassCourse',
  props<{ key: string; data: Array<CourseModel> }>()
);
export const setSecondaryClasses = createAction('[SecondaryClasses] SetSecondaryClasses',
  props<{ key: string; data: Array<Array<ClassModel>> }>()
);
