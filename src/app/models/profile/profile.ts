import { RubricModel } from '@models/rubric/rubric';
import { CourseMapPerformanceModel } from '../performance/performance';

export interface ProfileModel {
  about: string;
  birthDate?: string;
  country: string;
  countryId: string;
  diagAsmtState: string;
  bounds?: BoundsModel;
  course?: string;
  role: string;
  avatarUrl: string;
  fullName: string;
  createdAt: string;
  profileBaselineDone: string;
  lastUpdate: string;
  studentId: string;
  email: string;
  firstName: string;
  followers: number;
  dateOfBirth: string;
  followings: number;
  gender: string;
  grades: string;
  id: string;
  isFollowing: boolean;
  lastName: string;
  loginType: string;
  metadata?: string;
  parentUserId?: string;
  referenceId: string;
  rosterGlobalUserid?: string;
  rosterId: string;
  school?: string;
  schoolDistrict: string;
  schoolDistrictId: string;
  schoolId: string;
  state: string;
  stateId: string;
  thumbnail?: string;
  updatedAt?: string;
  userCategory?: string;
  username: string;
  isActive: boolean;
  isSelected?: boolean;
  deletionTriggerDate: Date;
  rubricGrade?: RubricModel;
  teacherRubric?: RubricModel;
  studentRubric?: RubricModel;
  isGraded?: boolean;
  isShowLearnerData?: boolean;
  performance?: CourseMapPerformanceModel;
}

export interface BoundsModel {
  gradeLowerBound: number;
  gradeUpperBound: number;
}

export interface CountryModel {
  code: string;
  id: string;
  name: string;
}

export interface LanguageModel {
  description: string;
  displayName: string;
  id: number;
  name: string;
  sequenceId: number;
}

export interface CaStudentListModel {
  id: string,
  firstName: string,
  lastName: string,
  name: string,
  avatarUrl: string,
  isSelected?: boolean,
  email: string
}

export interface StudentsClassesModel {
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  isDeleted: boolean;
  isEmailVerified: string;
  lastName: string;
  thumbnail: string;
  updatedAt: string;
  userCategory: string;
  username: string;
  status: boolean
}
