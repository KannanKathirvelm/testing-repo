const ROUTER_PATH = {
  login: 'login',
  loginWithTenantList: 'login/tenant-list',
  loginWithTenantUsername: 'login/tenant-username',
  forgotPassword: 'forgot-password',
  loginWithUsername: 'login-with-username',
  loginWithTenantUrl: 'login/tenant-url',
  signUp: 'sign-up',
  teacherHome: 'teacher-home',
  class: 'class/:id',
  atc: 'class/:id/atc',
  dataByMilestone: 'class/:id/atc/data-by-milestone',
  dataByDiagnostic: 'class/:id/atc/data-by-diagnostic',
  classActivities: 'class-activities',
  scheduledActivities: 'scheduled-activities',
  unScheduledActivities: 'unscheduled-activities',
  grading: 'grading',
  settings: 'class/:id/settings',
  journey: 'class/:id/journey',
  classProficiency: 'class/:id/proficiency/class-proficiency',
  classProgress: 'class/:id/proficiency/class-progress',
  domainCompetency: 'class/:id/proficiency/domain-competency',
  proficiency: 'class/:id/proficiency',
  profile: 'profile',
  aboutMe: 'about-me',
  preferences: 'preferences',
  StudentProficiency: 'student-proficiency/:id',
  classActivityFullPath: 'class/:id/class-activity/activities',
  classJourneyFullPath: 'class/:id/journey',
  scheduledActivitiesWithFullPath: 'class/:id/class-activities/scheduled-activities',
  emailVerify: 'email-verification',
  studentsProficiency: 'class/:id/proficiency/students-proficiency',
  deeplinkTenantLogin: 'instructors-login',
  addCourse: 'class/:id/add-course'
};

export function routerPath(pathname) {
  return ROUTER_PATH[pathname];
}

export function routerPathStartWithSlash(pathname) {
  return '/' + ROUTER_PATH[pathname];
}

export function routerPathIdReplace(pathname, id) {
  const path = ROUTER_PATH[pathname];
  return '/' + path.replace(':id', id);
}

export const CLASS_ROUTES = {
  CLASS_ACTIVITY: 'class-activities',
  JOURNEY: 'journey',
  PROFICIENCY: 'proficiency',
  COURSEMAP: 'course-map',
  ATC: 'atc',
  SETTINGS: 'settings'
};

export function routerEventPath(pathname) {
  let path = pathname;
  if (pathname.indexOf('-')) {
    path = pathname.replace('-', '_');
  }
  return ROUTER_PATH[path];
}
