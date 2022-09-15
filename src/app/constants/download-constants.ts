export enum DOWNLOAD_STATE {
    INTIAL = 0,
    IN_PROGRESS = 1,
    DOWNLOADED = 2,
    PENDING = 3,
    CANCELLED = 4,
    ERROR = 5
};
export const DOWNLOAD_FILE_EXTENSIONS = [
    'png',
    'jpeg',
    'jpg',
    'bmp',
    'gif',
    'pdf',
    'html',
    'mp3',
    'mp4'
];

export enum SYNC_STATUS_CODE {
    PENDING = 1,
    COMEPLETED = 2,
    ERROR = 3,
    QUEUE = 4
};

export const DOWNLOAD_MEDIA_EXTENSIONS = {
    YOUTUBE: 'youtube.com',
    DRIVE: 'drive.google.com',
    DOC: 'docs.google.com',
    YT_SHORLINK: 'youtu.be',
};

export enum TASK_RESULT_STATUS {
    RUNNING = 'RUNNING',
    TERMINATED = 'TERMINATED'
};

export const SYNC_STATUS_MESSAGE = {
    sync_pending: SYNC_STATUS_CODE.PENDING,
    sync_error: SYNC_STATUS_CODE.ERROR,
    sync_inprogress: SYNC_STATUS_CODE.PENDING,
    sync_completed: SYNC_STATUS_CODE.COMEPLETED,
};
