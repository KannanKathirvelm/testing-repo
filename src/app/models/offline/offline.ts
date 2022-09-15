export interface OfflineClassSettingsModel {
    classId: string;
    settings: {
        isOfflineAccessEnabled: string
    }
}
export interface UploadSyncStatusModel {
    completedPercentage: number,
    fileName: string,
    status: string,
    syncStatusCode: number,
    uploadId: number,
    uploadedAt: string,
}
