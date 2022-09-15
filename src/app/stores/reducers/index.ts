import {
  classCourseStateReducer,
  classMembersStateReducer,
  classStateReducer,
  secondaryClassesStateReducer
} from '@stores/reducers/class.reducer';
import {
  collectionStateReducer,
  unitLessonStateReducer,
  unitStateReducer
} from '@stores/reducers/course-map.reducer';
import {
  classificationsStateReducer,
  countriesStateReducer,
  languagesStateReducer,
  tenantSettingsStateReducer
 } from '@stores/reducers/lookup.reducer';
import {
  lessonStateReducer,
  milestoneStateReducer,
} from '@stores/reducers/milestone.reducer';
import {
  taxonomyCACompetencyStateReducer,
  taxonomyCADomainStateReducer,
  taxonomyCATopicStateReducer,
  taxonomyGradesStateReducer
} from '@stores/reducers/taxonomy.reducer';

export const reducers = {
  classMembers: classMembersStateReducer,
  classes: classStateReducer,
  taxonomyGrades: taxonomyGradesStateReducer,
  classCourses: classCourseStateReducer,
  secondaryClasses: secondaryClassesStateReducer,
  milestone: milestoneStateReducer,
  lesson: lessonStateReducer,
  collection: collectionStateReducer,
  unit: unitStateReducer,
  unitLesson: unitLessonStateReducer,
  taxonomyCADomain: taxonomyCADomainStateReducer,
  taxonomyCATopic: taxonomyCATopicStateReducer,
  taxonomyCACompetency: taxonomyCACompetencyStateReducer,
  tenantSettings: tenantSettingsStateReducer,
  classifications: classificationsStateReducer,
  countries: countriesStateReducer,
  languages: languagesStateReducer
};
