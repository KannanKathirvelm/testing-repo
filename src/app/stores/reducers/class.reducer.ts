import { Action, createReducer, createSelector, on } from '@ngrx/store';
import {
  setActiveClass,
  setActiveClassCourse,
  setClassMembers,
  setSecondaryClasses
} from '@stores/actions/class.action';

const stateValue = (state) => state;

/**
 * @function getClassById
 * @param {string} classId
 * This method is used to fetch class
 */
export const getClassById = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.classes ? stateItem.classes[classId] : null;
});

/**
 * @function getClassMembersByClassId
 * @param {string} classId
 * This method is used to fetch class members
 */
export const getClassMembersByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.classMembers ? stateItem.classMembers[classId] : null;
});

/**
 * @function getClassCourseById
 * @param {string} classId
 * This method is used to fetch class course
 */
export const getClassCourseById = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.classCourses ? stateItem.classCourses[classId] : null;
});

/**
 * @function getSecondaryClasses
 * @param {string} classId
 * This method is used to fetch secondary classes
 */
export const getSecondaryClasses = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.secondaryClasses ? stateItem.secondaryClasses[classId] : null;
});

/**
 * @function classReducer
 * This method is used to store the state class data
 */
const classReducer = createReducer({},
  on(setActiveClass, (state, { key, data }) => setStateData(state, key, data)));

/**
 * @function classMembersReducer
 * This method is used to store the state data
 */
const classMembersReducer = createReducer({},
  on(setClassMembers, (state, { key, data }) => setStateData(state, key, data)));


/**
 * @function classCourseReducer
 * This method is used to store the state class course data
 */
const classCourseReducer = createReducer({},
  on(setActiveClassCourse, (state, { key, data }) => setStateData(state, key, data)));

/**
 * @function secondaryClassesReducer
 * This method is used to store the state class course data
 */
const secondaryClassesReducer = createReducer({},
  on(setSecondaryClasses, (state, { key, data }) => setStateData(state, key, data)));

// -------------------------------------------------------------------------
// Methods


function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function classMembersStateReducer(state, action: Action) {
  return classMembersReducer(state, action);
}

export function classStateReducer(state, action: Action) {
  return classReducer(state, action);
}

export function classCourseStateReducer(state, action: Action) {
  return classCourseReducer(state, action);
}

export function secondaryClassesStateReducer(state, action: Action) {
  return secondaryClassesReducer(state, action);
}
