
export const GOORU_SHORT_NAME = 'gooru';

export const TOOLBAR_OPTIONS = {
  BACKGROUND_COLOR: '#0072bc',
  FONT_COLOR: '#ffffff'
};

export const PROFICIENCY_CHART_COLORS = {
  CELL_STROKE: '#ffffff',
  NOT_STARTED: '#dcdfe0',
  IN_PROGRESS: '#1aa9eb',
  MASTERED: '#1d7dc2'
};

export const CORRECT_ANSWER_YES = 'yes';

export const STANDARD_LEVEL = 'standard_level_1';

export const TEACHER_ROLE = 'teacher';

export const MASTER_COMPETENCY = 'competencyMastery';

export const PROFICIENCY = 'proficiency';

export const GOORU_CATALOG = 'Gooru Catalog';

export const MICRO_COMPETENCY_CODE_TYPES = [
  'learning_target_level_0',
  'learning_target_level_1',
  'learning_target_level_2'
];

export const NOTIFICATION_TYPE = {
  STUDENT_GRADABLE_SUBMISSION: 'student.gradable.submission',
  STUDENT_SELF_REPORT: 'student.self.report',
  CFU_FAILED_TWICE_TEACHER_NOTIFICATION: 'cfu.failed.twice.teacher.notification'
};

export const SUBJECTS_SUBJECT_CODE = [
  {
    title: 'Math',
    code: 'K12.MA',
    id: '1'

  },
  {
    title: 'Science',
    code: 'K12.NMS',
    id: '2'
  },
  {
    title: 'ELA',
    code: 'K12.ELA',
    id: '3'
  }
];

export const STUDENT_ROLE = 'student';

export const COMPETENCY = 'competency';

export const DEFAULT_FRAMEWORK = 'GDT';

export const MIN_AGE_TO_JOIN = 13;

export const DEFAULT_IMAGES = {
  COURSE: 'assets/images/default-course.png',
  COLLECTION: 'assets/images/collection-default.png',
  ASSESSMENT: 'assets/images/assessment-default.png',
  ASSESSMENT_EXTERNAL: 'assets/images/assessment-default.png',
  PROFILE_IMAGE: 'assets/images/icons/profile.png',
  OFFLINE_ACTIVITY: 'assets/images/offline-activity.png'
};

export const DEFAULT_IMAGES_XS = {
  COLLECTION: 'assets/images/collection-default-xs.png',
  ASSESSMENT: 'assets/images/assessment-default-xs.png',
  ASSESSMENT_EXTERNAL: 'assets/images/assessment-default-xs.png'
};

export const COMPETENCY_STATUS = [
  'Not Started',
  'In Progress',
  'Mastered (Inferred)',
  'Mastered (Asserted)',
  'Mastered (Earned)',
  'Mastered'
];

export const TAXONOMY_LEVELS = {
  COURSE: 'course',
  DOMAIN: 'domain',
  STANDARD: 'standard',
  MICRO: 'micro-standard',
  QUESTION: 'question',
  RESOURCE: 'resource'
};

export const COMPETENCY_STATUS_VALUE = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  INFERRED: 2,
  ASSERTED: 3,
  EARNED: 4,
  DEMONSTRATED: 5,
  REINFORCEDMASTERY:6
};

export const CONTENT_TYPES = {
  OFFLINE_ACTIVITY: 'offline-activity',
  ASSESSMENT: 'assessment',
  COLLECTION: 'collection',
  ASSESSMENT_EXTERNAL: 'assessment-external',
  COLLECTION_EXTERNAL: 'collection-external',
  COURSE: 'course',
  QUESTION: 'question',
  RESOURCE: 'resource',
  LESSON: 'lesson',
  RUBRIC: 'rubric',
  UNIT: 'unit',
  MILESTONE: 'milestone',
  MEETING: 'meeting',
  DIAGNOSTIC_ASSESSMENT:'diagnostic-assessment'
};

export const SIGNATURE_CONTENT_TYPES = {
  ASSESSMENT: 'signature-assessment',
  COLLECTION: 'signature-collection',
  DIAGNOSTIC_ASSESSMENT:'diagnostic-assessment'
};

export const COLLECTION_TYPES = {
  collection: 'collections',
  assessment: 'assessments',
  'assessment-external': 'assessments-external',
  'collection-external': 'collections-external'
};

export const MULTIPLE_SELECT_IMAGES = 'hot_spot_image_question';

export const RESOURCES_DEFAULT_IMAGES = {
  audio_resource: 'assets/images/default-audio-resource.png',
  image_resource: 'assets/images/default-image-resource.png',
  interactive_resource: 'assets/images/default-interactive-resource.png',
  text_resource: 'assets/images/default-text-resource.png',
  webpage_resource: 'assets/images/default-website-resource.png',
  video_resource: 'assets/images/default-video-resource.png'
};

export const GRADING_SCALE = [
  {
    LOWER_LIMIT: 0,
    COLOR: '#F46360',
    RANGE: '0-59'
  },
  {
    LOWER_LIMIT: 60,
    COLOR: '#ED8E36',
    RANGE: '60-69'
  },
  {
    LOWER_LIMIT: 70,
    COLOR: '#FABA36',
    RANGE: '70-79'
  },
  {
    LOWER_LIMIT: 80,
    COLOR: '#A8C99C',
    RANGE: '80-89'
  },
  {
    LOWER_LIMIT: 90,
    COLOR: '#4B9740',
    RANGE: '90-100'
  }
];

export const ERROR_TYPES = {
  FATAL: 'fatal',
  NON_FATAL: 'non-fatal'
};

export const REPORT_PERIOD_TYPE = {
  CURRENT_WEEK: 'current-week',
  PREVIOUS_WEEK: 'previous-week',
  TILL_NOW: 'till-now',
  CUSTOM_RANGE: 'custom-range'
};

export const COURSE_MAP = 'course-map';
export const MILESTONE = 'milestone';

export const SETTINGS = {
  ON: 'on',
  OFF: 'off'
};

export const PATH_TYPES = {
  SYSTEM: 'system',
  TEACHER: 'teacher',
  ROUTE: 'route0',
  UNIT0: 'unit0'
};

export const ROUTE_STATUS = {
  ACCEPTED: 'accepted',
  PENDING: 'pending',
  REJECTED: 'rejected',
  NA: 'na'
};

export const CALENDAR_VIEW = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  DATE_FORMAT: 'YYYY-MM-DD'
};

export const OFFLINE_ACTIVITY = 'offline-activity';
export const ASSESSMENT = 'assessment';
export const COLLECTION = 'collection';
export const ASSESSMENT_EXTERNAL = 'assessment-external';
export const COLLECTION_EXTERNAL = 'collection-external';

export const SCORES = {
  REGULAR: 60,
  GOOD: 70,
  VERY_GOOD: 80,
  EXCELLENT: 90
};

export const SUBMISSION_TYPES = [
  'uploaded',
  'remote',
  'free-form-text'
];

export const OA = {
  UPLOADS: 'uploaded',
  FREE_FORM_TEXT: 'free-form-text',
  FORM_TEXT: 'freeFormText'
};

export const OA_TASK_SUBMISSION_TYPES = [
  {
    value: 'image',
    submissionType: 'uploaded',
    validExtensions: '.jpg, .jpeg, .gif, .png',
    icon: 'fa-file-image-o'
  },
  {
    value: 'pdf',
    submissionType: 'uploaded',
    validExtensions: '.pdf',
    icon: 'fa-file-pdf-o'
  },
  {
    value: 'presentation',
    submissionType: 'uploaded',
    validExtensions: '.ppt, .pptx',
    icon: 'fa-file-powerpoint-o'
  },
  {
    value: 'document',
    submissionType: 'uploaded',
    validExtensions: '.doc, .docx',
    icon: 'fa-file-word-o'
  },
  {
    value: 'others',
    submissionType: 'uploaded',
    validExtensions: '',
    icon: 'fa-file'
  },
  {
    value: 'url',
    submissionType: 'remote',
    validExtensions: '',
    icon: 'fa-link'
  }
];

export const RUBRIC = {
  STUDENT: 'Self',
  TEACHER: 'Teacher',
  RUBRIC: 'Rubric'
};

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  GUARDIAN: 'guardian'
};

export const PLAYER_EVENT_SOURCE = {
  COURSE_MAP: 'coursemap',
  DAILY_CLASS: 'dailyclassactivity',
  OFFLINE_CLASS: 'offline-activity',
  INDEPENDENT_ACTIVITY: 'ILActivity',
  RGO: 'rgo',
  DIAGNOSTIC: 'diagnostic',
  MASTER_COMPETENCY: 'competencyMastery',
  CLASS_ACTIVITY: 'class-activity',
  PROFICIENCY: 'proficiency',
  CA: 'ca'
};

export const IMAGE = 'image';
export const FILE = 'fa-file';

export const PLAYER_TOOLBAR_OPTIONS = {
  BACKGROUND_COLOR: '#0072bc',
  FONT_COLOR: '#ffffff'
};

export const EXTERNAL_APP_PACKAGES = {
  GOOGLE_MEET_IOS_APP: 'com.google.apple.apps.meetings',
  GOOGLE_MEET_ANDROID_APP: 'com.google.android.apps.meetings',
  GOOGLE_CHROME_ANDROID_APP: 'com.android.chrome',
  GOOGLE_CHROME_IOS_APP: 'com.apple.chrome',
  SAFARI_APP: 'com.apple.safari',
  ZOOM_APP: 'us.zoom.videomeetings'
};

export const SEARCH_FILTER_BY_CONTENT_TYPES = [
  {
    format: 'collection',
    label: 'search-filter.collections',
    apiKey: 'searchCollections',
    seqId: 1
  },
  {
    format: 'assessment',
    label: 'search-filter.assessments',
    apiKey: 'searchAssessments',
    seqId: 2
  },
  {
    format: 'offline-activity',
    label: 'common.offline-activity',
    apiKey: 'searchOfflineActivity',
    seqId: 3
  }
];

export const SMP_STRING = 'Standards for Mathematical Practice';

export const CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS = {
  defaultView: 'defaultView',
  scopeAndSequence: 'scopeAndSequence',
  defaultScopeAndSequence: 'defaultScopeAndSequence'
};

export const LEVEL_ACTION_KEYS = {
  domainList: {
    actionKey: 'fetchDomainsByGrade',
    levelKey: 'domainList'
  },
  topicsList: {
    actionKey: 'fetchTopicsByDomain',
    levelKey: 'topicsList'
  },
  competenciesList: {
    actionKey: 'fetchCompetenciesByDomainTopic',
    levelKey: 'competenciesList'
  }
};

export const ASSESSMENT_SHOW_VALUES = {
  IMMEDIATE: 'immediate',
  SUMMARY: 'summary',
  NEVER: 'never'
};

export const ATTEMPTED_STATUS = {
  COMPLETE: 'complete',
  IN_PROGRESS: 'in-progress'
};


export const VIDEO_RESOURCE_TYPES = {
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo'
};

export const ATTEMP_STATUS = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped',
  ATTEMPTED: 'attempted'
};

export const SCORE_LEVEL = {
  INCORRECT: 0,
  CORRECT: 1,
  PARTIALLY_CORRECT: 2
}

export const SCOPE_AND_SEQUENCE_RESOURCE_TYPE = {
  TEACHERS: {
    name: 'teachers',
    'flt.audience': 'Teachers'
  },
  STUDENTS: {
    name: 'students',
    'flt.audience': 'All Students'
  }
};

export const TEACHER_NOTIFICATION_TYPES = [{
  type: 'student.self.report',
  translationKey: 'STUDENT_SELF_REPORT_TITLE'
},
{
  type: 'student.gradable.submission',
  translationKey: 'STUDENT_GRADABLE_SUBMISSION_TITLE'
}];

export const DEFAULT_SEARCH_PAGE_SIZE = 20;

export const TEACHER = 'Teachers';
export const STUDENTS = 'All Students';

export const AUDIENCE_LIST = [{
  name: 'Teachers',
  label: 'Teachers'
}, {
  name: 'All Students',
  label: 'Students'
}];

export const QUESTION_TYPES = {
  multipleChoice: 'MC',
  multipleAnswer: 'MA',
  trueFalse: 'T/F',
  openEnded: 'OE',
  fib: 'FIB',
  hotSpotText: 'HS_TXT',
  hotSpotImage: 'HS_IMG',
  hotTextReorder: 'HT_RO',
  hotTextHighlight: 'HT_HL',
  scientificfib: 'SE_FIB',
  scientificFreeResponse: 'SE_FRQ',
  encodingAssessment: 'SERP_EA',
  decodingAssessment: 'SERP_DA',
  sayOutLoud: 'SERP_SOL',
  identifyDigraph: 'SERP_ID',
  readingQuestion: 'SERP_RQ',
  wordsPerMinute: 'SERP_WPM',
  silentReading: 'SERP_SR',
  phraseCuedReading: 'SERP_PCR',
  comprehension: 'SERP_AFC',
  vowelsQuestions: 'SERP_VOWELS',
  countingSyllable: 'SERP_CS',
  baseWords: 'SERP_IB',
  vowelTeams: 'SERP_VT',
  dividingSyllables: 'SERP_SD',
  classic: 'SERP_CL',
  chooseOne: 'SERP_CO',
  pickNChoose: 'SERP_PNC'
};

export const ITEMS_TO_GRADE_TABS = {
  FRQ: [{
    title: 'STUDENT_RUBRIC',
    isActive: true
  }, {
    title: 'TEACHER_RUBRIC',
    isActive: false
  }],
  OA: [{
    title: 'STUDENT_RUBRIC',
    isActive: true
  }, {
    title: 'ANSWER',
    isActive: false
  }, {
    title: 'TEACHER_RUBRIC',
    isActive: false
  }]
}

export const COLLECTION_SUB_FORMAT_TYPES = {
  RESOURCE: 'resource',
  QUESTION: 'question'
};

export const OPEN_ENDED_QUESTION = 'open_ended_question';

export const USER_ROLE = {
  TEACHER: 1,
  STUDENT: 2
};

export const FEEDBACK_TYPES = {
  QUANTITATIVE: 1,
  QUALITATIVE: 2,
  BOTH: 3
};

export const PLAYER_EVENT_TYPES = {
  START: 'start',
  STOP: 'stop'
};

export const PLAYER_EVENTS = {
  REACTION: 'reaction.create',
  COLLECTION_PLAY: 'collection.play',
  RESOURCE_PLAY: 'collection.resource.play'
};

export const QUESTION_TYPES_CONFIG = {
  fill_in_the_blank_question: 'FIB',
  multiple_choice_question: 'MC',
  true_false_question: 'T/F',
  hot_text_reorder_question: 'HT_RO',
  multiple_answer_question: 'MA',
  hot_spot_image_question: 'HS_IMG',
  hot_spot_text_question: 'HS_TXT',
  hot_text_highlight_question: 'HT_HL',
  open_ended_question: 'OE',
  scientific_fill_in_the_blank_question: 'SE_FIB',
  scientific_free_response_question: 'SE_FRQ',
  serp_encoding_assessment_question: 'SERP_EA',
  serp_decoding_assessment_question: 'SERP_DA',
  serp_lang_say_out_loud_question: 'SERP_SOL',
  serp_lang_identify_digraph_question: 'SERP_ID',
  serp_words_per_minute_question: 'SERP_WPM',
  serp_silent_reading_question: 'SERP_SR',
  serp_phrase_cued_reading_question: 'SERP_PCR',
  serp_lang_activities_for_comprehension_question: 'SERP_AFC',
  serp_lang_identify_base_word_question: 'SERP_IB',
  serp_lang_vowel_teams_question: 'SERP_VT',
  serp_lang_counting_syllables_question: 'SERP_CS',
  serp_lang_syllable_division_question: 'SERP_SD',
  serp_classic_question: 'SERP_CL',
  serp_choose_one_question: 'SERP_CO',
  serp_pick_n_choose_question: 'SERP_PNC',
  serp_sorting_question: 'SERP_SO',
  serp_multi_choice_question: 'SERP_MC',
  serp_identify_vowel_sound_activity_question: 'SERP_IVSA'
};

export const MIN_AGE_TO_GOOGLE_SIGNUP = 13;

export const MIN_AGE = 3;

export const API_ERROR_MSG = {
  EMAIL_NOT_VERIFIED_MSG: 'email address still not verified'
};

export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'danger'
}

export const MEETING_TOOLS = {
  zoom: 'zoom',
  hangout: 'hangout'
};

export const SORTING_TYPES = {
  ascending: 'asc',
  descending: 'desc'
}

export const CLASSREPORTS = [
  {
    name: 'Class Progress Report',
    key: 'class-progress-report'
  },
  {
    name: 'Domain Competency Report',
    key: 'domain-competency-report'
  },
  {
    name: 'Class Proficiency Report',
    key: 'class-proficiency-report'
  }
];

export const PREFERENCE = [
  {
    name: 'Recently Updated',
    key: 'recently_updated'
  },
  {
    name: 'Alphabetical',
    key: 'alphabetical'
  }
];

export const OA_TEXT = 'oa';

export const OA_TYPE = {
  COURSE_MAP: 'coursemap',
  DCA: 'dca'
}

export const STUDENT_PROGRESS_COLOR = [
  '#d6caff',
  '#a184fac9',
  '#7a4bedb5',
  '#6627d7ad',
  '#5215b6d6'
];

export const DONUT_IMAGES = {
  USER_PROFILE: 'assets/images/icons/profile.png',
  COMPETENCY_ICON: 'assets/images/icons/competency-icon.png'
};

export const DEFAULT_CLASS_IMAGES = {
  CLASS_DEFAULT_0: 'assets/images/subject-classroom-bg-one.png',
  CLASS_DEFAULT_1: 'assets/images/subject-classroom-bg-two.png',
  CLASS_DEFAULT_2: 'assets/images/subject-classroom-bg-three.png'
}

export const SUPPORTED_SERP_QUESTION_TYPES = [
  'serp_lang_say_out_loud_question',
  'serp_encoding_assessment_question',
  'serp_decoding_assessment_question',
  'serp_pick_n_choose_question',
  'serp_sorting_question',
  'serp_lang_activities_for_comprehension_question',
  'serp_multi_choice_question',
  'serp_silent_reading_question'
];

export const SERP_QUESTION_TITLES = {
  serp_lang_say_out_loud_question: 'SAY_OUT_LOUD',
  serp_encoding_assessment_question: 'ENCODING_ASSESSMENT',
  serp_decoding_assessment_question: 'DECODING_ASSESSMENT',
  serp_pick_n_choose_question: 'PICK_AND_CHOOSE',
  serp_sorting_question: 'SORTING',
  serp_lang_activities_for_comprehension_question: 'COMPREHENSION',
  serp_lang_identify_digraph_question: 'UNDERLINE',
  serp_words_per_minute_question: 'WORDS_PER_MINUTE',
  serp_silent_reading_question: 'SILENT_READING',
  serp_phrase_cued_reading_question: 'READING_QUESTION',
  serp_lang_identify_base_word_question: 'BASE_WORD',
  serp_lang_vowel_teams_question: 'VOWEL_TEAMS',
  serp_lang_counting_syllables_question: 'COUNTING_SYLLABLES',
  serp_lang_syllable_division_question: 'SYLLABLE_DIVISION',
  serp_classic_question: 'CLASSIC_QUESTION',
  serp_choose_one_question: 'CHOOSE_ONE_QUESTION',
  serp_multi_choice_question: 'SERP_MULTI_CHOICE'
};


export const EMAIL_TEMPLATE_NAME = {
  SIGNUP_MAIL: 'signup_invite_student'
};

export const LIBRARY_CONTENT_SOURCE = [
  {
    name: 'Gooru Catalog',
    sourceKey:'gooru-catalog',
    thumbnail:'assets/icons/gooru-logo.svg'
  },
  {
    name: 'My Content',
    sourceKey:'my-content',
    thumbnail:'assets/images/icons/profile.png'
  }
]

export const REPORT_FILTERS = {
  MASTERED: 'mastered',
  INPROGRESS: 'in progress',
  ALL: 'all'
};

export const GUT = 'GUT';
