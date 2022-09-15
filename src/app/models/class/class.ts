import { ClassCompetencySummaryModel, CurrentLocation } from '@models/competency/competency';
import { CourseModel } from '@models/course/course';
import { CAPerformanceModel, PerformanceModel } from '@models/performance/performance';
import { ProfileModel } from '@models/profile/profile';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';

export interface ClassMembersModel {
  collaborators: Array<ProfileModel>;
  memberGradeBounds: Array<ClassMembersGrade>;
  members: Array<ProfileModel>;
  owner: ProfileModel;
  details: Array<ClassMembersDetailModel>;
}

export interface ClassMembersDetailModel {
  createdAt: number;
  diagAsmtState: string;
  email: string;
  firstName: string;
  id: string;
  initialLpDone: boolean;
  isActive: boolean;
  lastName: string;
  profileBaselineDone: boolean;
  rosterGobalUserid: string;
  thumbnail: string;
  showEmail: boolean;
}

export interface MemberGradeBoundsModel {
  [key: string]: {
    gradeLowerBound: number;
    gradeUpperBound: number;
  };
}

export interface ClassesModel {
  activeClasses?: Array<ClassModel>;
  classes: Array<ClassModel>;
  collaborator: Array<string>;
  member: Array<string>;
  memberCount: number;
  owner: string;
  teacherDetails: Array<TeacherDetailsModel>;
  setting?: Settings;
}
export interface ClassModel {
  classSharing: string;
  code: string;
  collaborator: string;
  contentVisibility: string;
  courseId: string;
  courseTitle: string;
  courseVersion: string;
  coverImage: string;
  createdAt?: string;
  creatorId?: string;
  description: string;
  endDate?: string;
  forceCalculateIlp?: boolean;
  gooruVersion?: number;
  grade: string;
  gradeCurrent?: number;
  gradeLowerBound?: number;
  gradeUpperBound?: number;
  greeting: string;
  id: string;
  isArchived: boolean;
  milestoneViewApplicable?: boolean;
  minScore: number;
  primaryLanguage?: string;
  preference?: any;
  rosterId: string;
  route0Applicable?: boolean;
  setting: TenantSettingsModel;
  title: string;
  updatedAt: string;
  currentLocation?: CurrentLocation;
  competencyStats?: ClassCompetencySummaryModel;
  course?: CourseModel | {
    thumbnailUrl: string;
    title?: string
  };
  isPublic: boolean;
  isPremiumClass?: boolean;
  grade_current?: string;
  performanceSummary?: PerformanceModel;
  performanceSummaryForDCA?: CAPerformanceModel;
  tenantSettings?: TenantSettingsModel;
  rosterGrade?: RosterGradeModel;
  owner?: any;
  isOfflineAccessEnabled?: boolean;
}
export interface SecondaryClasses {
  confirmation: boolean;
  list: Array<string>;
}
export interface Settings {
  coursePremium: boolean;
  masteryPpplicable: string;
  SecondaryClasses: SecondaryClasses;
}
export interface TeacherDetailsModel {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  rosterGlobalUserid: string;
  thumbnail: string;
}
export interface ClassMembersGrade {
  userId: string;
  bounds: ClassMembersGradeBound;
}

export interface ClassMembersGradeBound {
  gradeLowerBound: number;
  gradeUpperBound: number;
  gradeLevel?: number;
}

export interface ClassPerformanceModel {
  classId: string;
  id: string;
  score: number;
  sessionId: string;
  timeSpent: number;
  total: number;
  totalCompleted: number;
}

export interface SecondaryClassesModel {
  id: string;
  code: string;
  title: string;
}

export interface RosterGradeSubjectModel {
  gradeName: string;
  code: string;
  fwCode: string;
  label: string;
  gradeId: string;
}

export interface RosterGradeModel {
  rosterId: string;
  subjects: Array<RosterGradeSubjectModel>;
  lowerRosterGrade: string;
}

export interface MailClassesModel {
  mail_template_name: string,
  to_addresses: Array<string>,
  mail_template_context: MailContext
}

export interface MailContext {
  teacher_name: string,
  class_name: string,
  class_code: string,
  signup_url: string
}

export interface CourseVisibilityModel {
  id: string;
  units: Array<UnitsVisibilityModel>;
}

export interface UnitsVisibilityModel {
  id: string;
  lessons: Array<LessonsVisibilityModel>;
}

export interface LessonsVisibilityModel {
  id: string;
  assessments: Array<CollectionsVisibilityModel>;
  collections: Array<CollectionsVisibilityModel>;
}

export interface CollectionsVisibilityModel {
  id: string;
  visible: string;
}