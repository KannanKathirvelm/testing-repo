import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setMilestone, setMilestoneLesson } from '@stores/actions/milestone.action';

const stateValue = (state) => state;

export const getMilestoneByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.milestone ? stateItem.milestone[classId] : null;
});

export const getLessonByMilestoneId = (milestoneId) => createSelector(stateValue, (stateItem) => {
  return stateItem.lesson ? stateItem.lesson[milestoneId] : null;
});

const milestoneReducer = createReducer({},
  on(setMilestone, (state, { key, data }) => setStateData(state, key, data)));

const lessonReducer = createReducer({},
  on(setMilestoneLesson, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function milestoneStateReducer(state, action: Action) {
  return milestoneReducer(state, action);
}

export function lessonStateReducer(state, action: Action) {
  return lessonReducer(state, action);
}
